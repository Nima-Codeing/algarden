import { Controller, Get, Post } from '@nestjs/common';
import { GardenService } from './garden.service';
import { Garden } from 'generated/prisma/client';

@Controller('garden')
export class GardenController {
  constructor(private readonly gardenService: GardenService) {}

  @Get('active')
  async findByActive(userId: string): Promise<Garden | null> {
    return await this.gardenService.getActive(userId);
  }

  @Post('reset')
  async reset(userId: string): Promise<Garden> {
    return await this.gardenService.reset(userId);
  }
}
