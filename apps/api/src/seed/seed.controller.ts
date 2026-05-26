import { Controller, Get, UseGuards } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Seed } from 'generated/prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('seeds')
@UseGuards(AuthGuard('jwt'))
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  async findByActiveGarden(@CurrentUser('id') userId: string): Promise<Seed[]> {
    return await this.seedService.getSeedsByActiveGarden(userId);
  }
}
