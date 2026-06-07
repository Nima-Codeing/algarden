import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { Garden, Plant, PlantNode } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PlantSeedDto } from './dto/plant-seed.dto';

@Injectable()
export class GardenService {
  constructor(private readonly prismaService: PrismaService) {}

  // ユーザーの今月(Active)のGardenを取得する
  async getActive(userId: string): Promise<Garden> {
    const garden = await this.prismaService.garden.findFirst({
      where: {
        userId,
        isActive: true,
      },
    });
    if (!garden)
      throw new NotFoundException('アクティブなGardenが見つかりません。');
    return garden;
  }

  async reset(userId: string): Promise<Garden> {
    // 現在のガーデンを閉じる
    try {
      await this.prismaService.garden.updateMany({
        where: {
          userId,
          isActive: true,
        },
        data: {
          isActive: false,
          endedAt: new Date(),
        },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new BadRequestException('育成中のガーデンがありません。');
        }
      }
      throw e;
    }

    // 新しいガーデンを作成
    return await this.prismaService.garden.create({
      data: {
        userId,
        periodType: 'MONTHLY',
        plantedSeeds: {
          create: {},
        },
      },
      include: { plantedSeeds: true },
    });
  }

  async plantSeed(
    userId: string,
    gardenId: string,
    { seedId, x, y }: PlantSeedDto,
  ): Promise<Plant & { plantNodes: PlantNode[] }> {
    // オーナーシップ検証
    const garden = await this.prismaService.garden.findFirst({
      where: { id: gardenId, userId },
    });

    if (!garden) throw new ForbiddenException();

    const newPlant = await this.prismaService.$transaction(async (tx) => {
      const seed = await tx.seed
        .update({
          where: { id: seedId },
          data: {
            x,
            y,
            isPlanted: true,
            plantedAt: new Date(),
          },
        })
        .catch((e) => {
          if (
            e instanceof PrismaClientKnownRequestError &&
            e.code === 'P2025'
          ) {
            throw new BadRequestException('この種はすでに植えられています。');
          }
          throw e;
        });

      const plant = await tx.plant.create({
        data: { gardenId, seedId: seed.id },
      });

      // ルートノード生成
      await tx.plantNode.create({
        data: {
          hue: 120.0,
          size: 20.0,
          depth: 0,
          plantId: plant.id,
        },
      });

      return await tx.plant.findFirst({
        where: { id: plant.id },
        include: { plantNodes: true },
      });
    });

    if (!newPlant) throw new Error('cant spown new plant');
    return newPlant;
  }
}
