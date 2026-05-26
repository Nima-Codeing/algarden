import { Injectable } from '@nestjs/common';
import { Seed } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SeedService {
  constructor(private readonly prismaService: PrismaService) {}

  async getSeedsByActiveGarden(userId: string): Promise<Seed[]> {
    return await this.prismaService.seed.findMany({
      where: {
        garden: {
          userId,
          isActive: true,
        },
      },
    });
  }
}
