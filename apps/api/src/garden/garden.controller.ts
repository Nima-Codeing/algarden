import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { GardenService } from './garden.service';
import { Garden } from 'generated/prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('gardens')
@UseGuards(AuthGuard('jwt'))
export class GardenController {
  constructor(private readonly gardenService: GardenService) {}

  @Get()
  async findByActive(@CurrentUser('id') userId: string): Promise<Garden> {
    return await this.gardenService.getActive(userId);
  }

  @Post('reset')
  async reset(@CurrentUser('id') userId: string): Promise<Garden> {
    return await this.gardenService.reset(userId);
  }
}
