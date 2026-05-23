import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { PlantNode, Todo } from 'generated/prisma/client';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { RequestUser } from 'src/auth/types/requsetUser.types';

@Controller('todos')
@UseGuards(AuthGuard('jwt'))
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  async findAll(@Req() req: Request & { user: RequestUser }): Promise<Todo[]> {
    return await this.todoService.findActiveGardenTodos(req.user.id);
  }

  @Post()
  async create(
    @Body() createTodoDto: CreateTodoDto,
    @Req() req: Request & { user: RequestUser },
  ): Promise<Todo> {
    return await this.todoService.create(createTodoDto, req.user.id);
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
  async startTimer(
    @Param('id') id: string,
    @Req() req: Request & { user: RequestUser },
  ): Promise<Todo> {
    return await this.todoService.startTimer(id, req.user.id);
  }

  @Patch(':id/complete')
  async complete(
    @Param('id') id: string,
    @Body('plantId') plantId: string,
  ): Promise<PlantNode[]> {
    return await this.todoService.complete(id, plantId);
  }
}
