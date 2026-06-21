import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { GardenModule } from 'src/garden/garden.module';
import { PlantModule } from 'src/plant/plant.module';

@Module({
  imports: [GardenModule, PlantModule],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
