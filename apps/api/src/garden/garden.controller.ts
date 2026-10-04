import { Controller, Get, UseGuards } from '@nestjs/common';
import { GardenService } from './garden.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { GardenWithPlants } from './types/garden.types';

@Controller('gardens')
@UseGuards(AuthGuard('jwt'))
export class GardenController {
  constructor(private readonly gardenService: GardenService) {}

  @Get()
  async findByActive(
    @CurrentUser('id') userId: string,
  ): Promise<GardenWithPlants> {
    return await this.gardenService.getActive(userId);
  }
}
