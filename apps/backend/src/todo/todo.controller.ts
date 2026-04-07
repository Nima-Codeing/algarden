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
import { Todo } from 'generated/prisma/client';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  // test用
  DEV_USER_ID: string = '0430b4bd-7ea1-40cc-9481-78c879c98198';
  DEV_GARDEN_ID: string = 'd0be871b-a0bc-457f-999a-2f858765d591';

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
}
