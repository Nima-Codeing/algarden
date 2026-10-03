import { Injectable } from '@nestjs/common';
import { Seed } from 'generated/prisma/client';
import { DateService } from 'src/common/date/date.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SeedService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly dateService: DateService,
  ) {}

  async getSeedsByActiveGarden(userId: string): Promise<Seed[]> {
    const endAt = this.dateService.getNextMonthFirstDayUTC();

    return await this.prismaService.seed.findMany({
      where: {
        garden: {
          userId,
          endAt,
        },
      },
    });
  }
}
