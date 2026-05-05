import { Controller, Get } from '@nestjs/common';
import { GardenService } from './garden.service';
import { Garden } from 'generated/prisma/client';

@Controller('garden')
export class GardenController {
  constructor(private readonly gardenService: GardenService) {}

  @Get('active')
  async findByActive(userId: string): Promise<Garden | null> {
    return await this.gardenService.getActive(userId);
  }
}
