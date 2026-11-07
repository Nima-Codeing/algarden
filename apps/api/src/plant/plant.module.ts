import { Module } from '@nestjs/common';
import { PlantService } from './plant.service';
import { RandomModule } from '../common/random/random.module';
import { DateModule } from '../common/date/date.module';

@Module({
  providers: [PlantService],
  exports: [PlantService],
  imports: [RandomModule, DateModule],
})
export class PlantModule {}
