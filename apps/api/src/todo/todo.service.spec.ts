import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from './todo.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GardenService } from 'src/garden/garden.service';
import { PlantService } from 'src/plant/plant.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

describe('TodoService', () => {
  let service: TodoService;

  const prismaMock = {
    todo: {
      findFirst: jest.fn(),
      findFirstOrThrow: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  const gardenMock = { getActive: jest.fn() };
  const plantMock = {
    getAllPlants: jest.fn(),
    calcGrowthStage: jest.fn(),
    grow: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prismaMock.$transaction.mockImplementation(
      (cb: (tx: typeof prismaMock) => unknown) => cb(prismaMock),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: GardenService, useValue: gardenMock },
        { provide: PlantService, useValue: plantMock },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
  });

  const prismaError = (code: string) =>
    new PrismaClientKnownRequestError('', { code, clientVersion: 'test' });

  describe('updateTitle', () => {
    it('他ユーザーのTodoを更新できないよう、更新条件にuserIdを含める', async () => {
      await service.updateTitle('todo-1', 'user-1', {
        title: 'test name changed',
      });

      expect(prismaMock.todo.update).toHaveBeenCalledWith({
        where: { id: 'todo-1', userId: 'user-1', completedAt: null },
        data: { title: 'test name changed' },
      });
    });
  });

  describe('updateTargetDuration', () => {
    it('開始後に目標時間を変更できないよう、更新条件にstartedAtを含める', async () => {
      await service.updateTargetDuration('todo-1', 'user-1', {
        targetDuration: 600,
      });

      expect(prismaMock.todo.update).toHaveBeenCalledWith({
        where: {
          id: 'todo-1',
          userId: 'user-1',
          startedAt: null,
          completedAt: null,
        },
        data: { targetDuration: 600 },
      });
    });
  });

  describe('delete', () => {
    it('他ユーザー・完了済のTodoを削除できないよう、削除条件にuserIdとcompletedAtを含める', async () => {
      await service.delete('todo-1', 'user-1');

      expect(prismaMock.todo.delete).toHaveBeenCalledWith({
        where: { id: 'todo-1', userId: 'user-1', completedAt: null },
      });
    });

    it('条件に合うTodoが無いとき、NotFoundExceptionに変換する', async () => {
      prismaMock.todo.delete.mockRejectedValueOnce(
        new PrismaClientKnownRequestError('Record to delete does not exist.', {
          code: 'P2025',
          clientVersion: 'test',
        }),
      );

      await expect(service.delete('todo-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('complete', () => {
    it('前期間のTodoでも、Todo自身のgardenIdのPlantに生やす', async () => {
      prismaMock.todo.findFirstOrThrow.mockResolvedValue({
        id: 'todo-1',
        gardenId: 'garden-prev',
        startedAt: new Date(),
        targetDuration: null,
      });
      plantMock.getAllPlants.mockResolvedValue([{ id: 'plant-1' }]);
      plantMock.calcGrowthStage.mockResolvedValue({
        curStage: 'SPROUT',
        isPromotion: false,
      });
      plantMock.grow.mockResolvedValue([]);
      prismaMock.todo.update.mockResolvedValue({});

      await service.complete('todo-1', 'user-1');

      expect(plantMock.getAllPlants).toHaveBeenCalledWith('garden-prev');
      expect(gardenMock.getActive).not.toHaveBeenCalled();
    });
  });

  describe('startTimer', () => {
    it('異常系: 他ユーザーのTodoは、存在を明かさないよう 404 で拒否する', async () => {
      prismaMock.todo.findFirst.mockResolvedValueOnce(null);

      const promise = service.startTimer('todo-1', 'other');

      await expect(promise).rejects.toBeInstanceOf(NotFoundException);
      await expect(promise).rejects.toThrow('TODOが見つかりません。');
      expect(prismaMock.todo.findFirst).toHaveBeenCalledWith({
        where: { id: 'todo-1', userId: 'other' },
      });
      expect(prismaMock.todo.update).not.toHaveBeenCalled();
    });

    it('異常系: 計測中のTodo自身を開始すると、BadRequestException を投げる', async () => {
      prismaMock.todo.findFirst
        .mockResolvedValueOnce({ id: 'todo-1', gardenId: 'garden-1' })
        .mockResolvedValueOnce({ id: 'todo-1' });

      const promise = service.startTimer('todo-1', 'user-1');

      await expect(promise).rejects.toBeInstanceOf(BadRequestException);
      await expect(promise).rejects.toThrow(
        'そのタスクのタイマーは既に作動しています。',
      );
      expect(prismaMock.todo.update).not.toHaveBeenCalled();
    });

    it('異常系: 他のTodoが計測中にTodoを開始すると、BadRequestException を投げる', async () => {
      prismaMock.todo.findFirst
        .mockResolvedValueOnce({ id: 'todo-1', gardenId: 'garden-1' })
        .mockResolvedValueOnce({ id: 'todo-2' });

      const promise = service.startTimer('todo-1', 'user-1');

      await expect(promise).rejects.toBeInstanceOf(BadRequestException);
      await expect(promise).rejects.toThrow(
        '他のタスクのタイマーが作動中です。',
      );
      expect(prismaMock.todo.update).not.toHaveBeenCalled();
    });

    it('異常系: 完了済みのTodoを開始しようとすると、書き込みが失敗し、BadRequestException を投げる', async () => {
      prismaMock.todo.findFirst
        .mockResolvedValueOnce({ id: 'todo-1', gardenId: 'garden-prev' })
        .mockResolvedValueOnce(null);
      prismaMock.todo.update.mockRejectedValueOnce(prismaError('P2025'));

      const promise = service.startTimer('todo-1', 'user-1');

      await expect(promise).rejects.toBeInstanceOf(BadRequestException);
      await expect(promise).rejects.toThrow('開始済のTODOです。');
    });

    it('正常系: 繰り越した先月のTodoでも、そのTodoが属する庭の中で計測中のTodoを探す', async () => {
      prismaMock.todo.findFirst
        .mockResolvedValueOnce({ id: 'todo-1', gardenId: 'garden-prev' })
        .mockResolvedValueOnce(null);
      prismaMock.todo.update.mockResolvedValueOnce({ id: 'todo-1' });

      await service.startTimer('todo-1', 'user-1');

      expect(prismaMock.todo.findFirst).toHaveBeenNthCalledWith(2, {
        where: {
          gardenId: 'garden-prev',
          startedAt: { not: null },
          completedAt: null,
        },
      });
      expect(gardenMock.getActive).not.toHaveBeenCalled();
    });
  });
});
