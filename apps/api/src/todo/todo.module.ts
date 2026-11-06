import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { GardenModule } from '../garden/garden.module';
import { PlantModule } from '../plant/plant.module';
import { RandomModule } from '../common/random/random.module';

@Module({
  imports: [GardenModule, PlantModule, RandomModule],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
