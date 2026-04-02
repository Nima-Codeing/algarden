import { Injectable } from '@nestjs/common';
import { Todo } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';

@Injectable()
export class TodoService {
  constructor(private readonly prismaService: PrismaService) {}

  async createTodo(
    createTodoDto: CreateTodoDto,
    userId: string,
    gardenId: string,
  ): Promise<Todo> {
    return await this.prismaService.todo.create({
      data: {
        ...createTodoDto,
        userId,
        gardenId,
      },
    });
  }
}
