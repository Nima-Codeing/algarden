import { Module } from '@nestjs/common';
import { PlantService } from './plant.service';
import { PlantController } from './plant.controller';
import { RandomModule } from 'src/common/random/random.module';

@Module({
  controllers: [PlantController],
  providers: [PlantService],
  exports: [PlantService],
  imports: [RandomModule],
})
export class PlantModule {}
