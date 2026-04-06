import { BadRequestException, Injectable } from '@nestjs/common';
import { Todo } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodoService {
  constructor(private readonly prismaService: PrismaService) {}

  async findByGardenId(gardenId: string): Promise<Todo[]> {
    return await this.prismaService.todo.findMany({
      where: { gardenId },
    });
  }

  async create(
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

  async update(updateTodoDto: UpdateTodoDto, todoId: string): Promise<Todo> {
    return await this.prismaService.todo.update({
      where: { id: todoId },
      data: { ...updateTodoDto },
    });
  }

  async delete(todoId: string): Promise<void> {
    await this.prismaService.todo.delete({
      where: { id: todoId },
    });
  }

  async startTimer(todoId: string, gardenId: string): Promise<Todo> {
    // 同時起動チェック
    const activeTodo = await this.prismaService.todo.findFirst({
      where: {
        gardenId,
        startedAt: { not: null },
        completedAt: null,
      },
    });
    if (activeTodo) {
      throw new BadRequestException('他TODOのタイマーが作動しています。');
    }

    // タイマー開始
    return await this.prismaService.todo.update({
      where: {
        id: todoId,
        startedAt: null,
      },
      data: { startedAt: new Date() },
    });
  }
}
