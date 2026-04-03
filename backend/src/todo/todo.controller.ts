import { Body, Controller, Get, Post } from '@nestjs/common';
import { TodoService } from './todo.service';
import { Todo } from 'generated/prisma/client';
import { CreateTodoDto } from './dto/create-todo.dto';

@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  // test用
  DEV_USER_ID: string = '025386ed-94f7-4fce-a4fe-6e734d1d32ea';
  DEV_GARDEN_ID: string = 'dfa918ab-60aa-4bea-880b-707183db098f';

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
}
