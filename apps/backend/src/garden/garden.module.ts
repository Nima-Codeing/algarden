import { Module } from '@nestjs/common';
import { GardenService } from './garden.service';
import { GardenController } from './garden.controller';

@Module({
  controllers: [GardenController],
  providers: [GardenService],
})
export class GardenModule {}
