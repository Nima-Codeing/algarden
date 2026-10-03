import { Module } from '@nestjs/common';
import { GardenService } from './garden.service';
import { GardenController } from './garden.controller';
import { DateModule } from 'src/common/date/date.module';

@Module({
  controllers: [GardenController],
  providers: [GardenService],
  exports: [GardenService],
  imports: [DateModule],
})
export class GardenModule {}
