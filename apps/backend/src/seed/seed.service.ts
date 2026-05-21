import { Injectable } from '@nestjs/common';
import { Seed } from 'generated/prisma/client';
import { GardenService } from 'src/garden/garden.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SeedService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly gardenService: GardenService,
  ) {}

  async getSeedsByActiveGarden(userId: string): Promise<Seed[]> {
    const activeGarden = await this.gardenService.getActive(userId);
    return await this.prismaService.seed.findMany({
      where: { gardenId: activeGarden.id },
    });
  }
}
