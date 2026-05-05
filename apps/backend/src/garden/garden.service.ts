import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { Garden } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GardenService {
  constructor(private readonly prismaService: PrismaService) {}

  // ユーザーの今月(Active)のGardenを取得する
  async getActive(userId: string): Promise<Garden | null> {
    return await this.prismaService.garden.findFirst({
      where: {
        userId,
        isActive: true,
      },
    });
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
}
