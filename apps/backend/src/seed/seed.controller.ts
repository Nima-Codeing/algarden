import { Controller, Get, Req } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Seed } from 'generated/prisma/client';
import { Request } from 'express';
import { RequestUser } from 'src/auth/types/requsetUser.types';

@Controller('seeds')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get('active')
  async findByActiveGarden(
    @Req() req: Request & { user: RequestUser },
  ): Promise<Seed[]> {
    return await this.seedService.getSeedsByActiveGarden(req.user.id);
  }
}
