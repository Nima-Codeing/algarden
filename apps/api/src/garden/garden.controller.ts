import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { GardenService } from './garden.service';
import { Garden } from 'generated/prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { RequestUser } from 'src/auth/types/requsetUser.types';

@Controller('gardens')
@UseGuards(AuthGuard('jwt'))
export class GardenController {
  constructor(private readonly gardenService: GardenService) {}

  @Get()
  async findByActive(
    @Req() req: Request & { user: RequestUser }, // TODO: create custom decorator
  ): Promise<Garden> {
    const userId = req.user.id;
    return await this.gardenService.getActive(userId);
  }

  @Post('reset')
  async reset(
    @Req() req: Request & { user: RequestUser }, // TODO: create custom decorator
  ): Promise<Garden> {
    const userId = req.user.id;
    return await this.gardenService.reset(userId);
  }
}
