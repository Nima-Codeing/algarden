import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { GardenModule } from 'src/garden/garden.module';

@Module({
  imports: [GardenModule],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
