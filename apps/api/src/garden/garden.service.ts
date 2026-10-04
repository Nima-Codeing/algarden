import { Injectable } from '@nestjs/common';

import { DateService } from 'src/common/date/date.service';
import { PlantService } from 'src/plant/plant.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { gardenSelect, GardenWithPlants } from './types/garden.types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

@Injectable()
export class GardenService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly plantService: PlantService,
    private readonly dateService: DateService,
  ) {}

  /**
   * ユーザーのアクティブなGardenを取得
   * 見つからない場合、新規作成
   *
   * @param userId
   * @returns
   */
  async getActive(userId: string): Promise<GardenWithPlants> {
    // Active Garden 有無確認
    const endAt = this.dateService.getNextMonthFirstDayUTC();

    const found = await this.prismaService.garden.findUnique({
      where: { userId_endAt: { userId, endAt } },
      select: gardenSelect,
    });
    if (found) return found;

    try {
      // ない場合、新規作成
      return await this.prismaService.$transaction(async (tx) => {
        const garden = await tx.garden.create({
          data: {
            userId,
            endAt,
          },
        });

        // シード生成
        const seed = await tx.seed.create({
          data: { gardenId: garden.id },
        });

        // シードをガーデンに植える
        await this.plantService.plantRoot(tx, garden.id, seed.id, 0, 0);

        return await tx.garden.findUniqueOrThrow({
          where: { id: garden.id },
          select: gardenSelect,
        });
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        // 一意制約エラーの場合、再取得
        return await this.prismaService.garden.findUniqueOrThrow({
          where: { userId_endAt: { userId, endAt } },
          select: gardenSelect,
        });
      }

      console.error(
        'An error occurred while retrieving or creating Active Garden.',
      );
      throw e;
    }
  }
}
