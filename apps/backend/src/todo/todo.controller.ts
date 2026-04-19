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
  DEV_USER_ID: string = 'b6f4e7ef-e227-48f6-bb9e-4e3739721f47';
  DEV_GARDEN_ID: string = '3be5dc99-3868-4623-96c0-d85cac3ecb56';

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
