import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { PlantSeedDto } from './dto/plant-seed.dto';
import { Plant, PlantNode } from 'generated/prisma/client';
import { gardenSelect, GardenWithPlants } from './types/garden.types';
import { DateService } from 'src/common/date/date.service';

@Injectable()
export class GardenService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly dateService: DateService,
  ) {}

  // ユーザーのアクティブなGardenを取得する
  async getActive(userId: string): Promise<GardenWithPlants> {
    const endAt = this.dateService.getNextMonthFirstDayUTC();

    const garden = await this.prismaService.garden.findFirst({
      select: gardenSelect,
      where: {
        userId,
        endAt,
      },
    });
    if (!garden) {
      throw new NotFoundException('アクティブなGardenが見つかりません。');
    }
    return garden;
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
      const seed = await tx.seed.findUnique({ where: { id: seedId } });
      if (!seed) throw new NotFoundException('種が見つかりません。');
      if (seed.isPlanted)
        throw new BadRequestException('この種はすでに植えられています。');

      await tx.seed.update({
        where: { id: seedId },
        data: { x, y, isPlanted: true, plantedAt: new Date() },
      });

      const plant = await tx.plant.create({
        data: { gardenId, seedId: seed.id },
      });

      // ルートノード生成
      await tx.plantNode.create({
        data: {
          x: 0,
          y: 0,
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
