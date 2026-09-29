import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { AuthGuard } from '@nestjs/passport';
import { TodoResponse } from './types/todo.types';
import { Todo } from 'generated/prisma/client';
import { PlantNodeResponse } from 'src/plant/types/plant.types';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('todos')
@UseGuards(AuthGuard('jwt'))
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  async findAll(@CurrentUser('id') userId: string): Promise<TodoResponse[]> {
    return await this.todoService.findActiveGardenTodos(userId);
  }

  @Post()
  async create(
    @Body() createTodoDto: CreateTodoDto,
    @CurrentUser('id') userId: string,
  ): Promise<Todo> {
    return await this.todoService.create(userId, createTodoDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @CurrentUser('id') userId: string,
  ): Promise<Todo> {
    return await this.todoService.update(id, userId, updateTodoDto);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.todoService.delete(id, userId);
  }

  // タイマー開始 + 同時起動チェック
  @Patch(':id/start')
  async startTimer(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<Todo> {
    return await this.todoService.startTimer(id, userId);
  }

  @Patch(':id/complete')
  async complete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<PlantNodeResponse[]> {
    return await this.todoService.complete(id, userId);
  }
}
