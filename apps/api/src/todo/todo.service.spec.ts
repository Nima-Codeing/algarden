import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from './todo.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GardenService } from 'src/garden/garden.service';
import { PlantService } from 'src/plant/plant.service';
import { NotFoundException } from '@nestjs/common';

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

  describe('updateTitle', () => {
    it('他ユーザーのTodoを更新できないよう、更新条件に userId を含める', async () => {
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
    it('開始後に目標時間を変更できないよう、更新条件に startedAt を含める', async () => {
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
    it('他ユーザーのTodoを削除できないよう、削除条件に userId を含める', async () => {
      await service.delete('todo-1', 'user-1');

      expect(prismaMock.todo.delete).toHaveBeenCalledWith({
        where: { id: 'todo-1', userId: 'user-1' },
      });
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
    it('タイマーの排他判定をTodo自身のgardenIdで行う', async () => {
      prismaMock.todo.findFirst
        .mockResolvedValueOnce({ id: 'todo-1', gardenId: 'garden-prev' })
        .mockResolvedValueOnce(null);
      prismaMock.todo.update.mockResolvedValue({ id: 'todo-1' });

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

    it('他ユーザーのTodoは起動できない', async () => {
      prismaMock.todo.findFirst.mockResolvedValue(null);

      await expect(service.startTimer('todo-1', 'other')).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.todo.update).not.toHaveBeenCalled();
    });
  });
});
