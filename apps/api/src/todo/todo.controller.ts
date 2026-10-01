import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { TodoService } from './todo.service';
import { TodoResponse } from './types/todo.types';
import { PlantNodeResponse } from 'src/plant/types/plant.types';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoTitleDto } from './dto/update-todo-title.dto';
import { UpdateTodoDurationDto } from './dto/update-todo-duration.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Todo } from 'generated/prisma/client';

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

  @Put(':id/title')
  async updateTitle(
    @Param('id') id: string,
    @Body() dto: UpdateTodoTitleDto,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.todoService.updateTitle(id, userId, dto);
  }

  @Put(':id/target-duration')
  async updateTargetDuration(
    @Param('id') id: string,
    @Body() dto: UpdateTodoDurationDto,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.todoService.updateTargetDuration(id, userId, dto);
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
