import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { PlantNode, Todo } from 'generated/prisma/client';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  // test用
  DEV_USER_ID: string = '17044d6a-c458-4622-ae3a-91a0716826ab';
  DEV_GARDEN_ID: string = '38102e5b-ae28-4940-bc07-694c7c2e9c8e';

  @Get()
  async findByGardenId(): Promise<Todo[]> {
    return await this.todoService.findByGardenId(this.DEV_GARDEN_ID);
  }

  @Post()
  async create(@Body() createTodoDto: CreateTodoDto): Promise<Todo> {
    return await this.todoService.create(
      createTodoDto,
      this.DEV_USER_ID,
      this.DEV_GARDEN_ID,
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<Todo> {
    return await this.todoService.update(updateTodoDto, id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.todoService.delete(id);
  }

  // タイマー開始 + 同時起動チェック
  @Patch(':id/start')
  async startTimer(@Param('id') id: string): Promise<Todo> {
    return await this.todoService.startTimer(id, this.DEV_GARDEN_ID);
  }

  @Patch(':id/complete')
  async complete(
    @Param('id') id: string,
    @Body('plantId') plantId: string,
  ): Promise<PlantNode[]> {
    return await this.todoService.complete(id, plantId);
  }
}
