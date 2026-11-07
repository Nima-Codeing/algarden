import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoTitleDto } from './dto/update-todo-title.dto';
import { UpdateTodoDurationDto } from './dto/update-todo-duration.dto';

describe('TodoController', () => {
  let controller: TodoController;

  const reqUserId = 'req-user-1';
  const reqTodoId = 'req-todo-1';

  const serviceMock = {
    findAllByActiveGarden: jest.fn(),
    create: jest.fn(),
    updateTitle: jest.fn(),
    updateTargetDuration: jest.fn(),
    remove: jest.fn(),
    startTimer: jest.fn(),
    complete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [{ provide: TodoService, useValue: serviceMock }],
    }).compile();

    controller = module.get<TodoController>(TodoController);
  });

  describe('findAll', () => {
    it('正常系: 受け取った値を、Serviceにそのまま渡していること', async () => {
      await controller.findAll(reqUserId);

      expect(serviceMock.findAllByActiveGarden).toHaveBeenCalledWith(reqUserId);
    });

    it('正常系: Serviceの戻り値を、無加工のまま返していること', async () => {
      const retVal = [{ id: 'todo-A' }, { id: 'todo-B' }];
      serviceMock.findAllByActiveGarden.mockResolvedValueOnce(retVal);

      const result = await controller.findAll(reqUserId);

      expect(result).toEqual(retVal);
    });
  });

  describe('create', () => {
    const reqCreateTodoDto = {
      title: 'todo-example-1',
      targetDuration: 60,
    } satisfies CreateTodoDto;

    it('正常系: 受け取った値を、Serviceにそのまま渡していること', async () => {
      await controller.create(reqCreateTodoDto, reqUserId);

      expect(serviceMock.create).toHaveBeenCalledWith(
        reqUserId,
        reqCreateTodoDto,
      );
    });

    it('正常系: Serviceの戻り値を、無加工のまま返していること', async () => {
      const retVal = { id: 'todo-A' };
      serviceMock.create.mockResolvedValueOnce(retVal);

      const result = await controller.create(reqCreateTodoDto, reqUserId);

      expect(result).toEqual(retVal);
    });
  });

  describe('updateTitle', () => {
    it('正常系: 受け取った値を、Serviceにそのまま渡していること', async () => {
      const reqUpdateTodoTitleDto = {
        title: 'req-updated-todo-title',
      } satisfies UpdateTodoTitleDto;

      await controller.updateTitle(reqTodoId, reqUpdateTodoTitleDto, reqUserId);

      expect(serviceMock.updateTitle).toHaveBeenCalledWith(
        reqTodoId,
        reqUserId,
        reqUpdateTodoTitleDto,
      );
    });
  });

  describe('updateTargetDuration', () => {
    it('正常系: 受け取った値を、Serviceにそのまま渡していること', async () => {
      const reqUpdateTodoTargetDurationDto = {
        targetDuration: 60,
      } satisfies UpdateTodoDurationDto;

      await controller.updateTargetDuration(
        reqTodoId,
        reqUpdateTodoTargetDurationDto,
        reqUserId,
      );

      expect(serviceMock.updateTargetDuration).toHaveBeenCalledWith(
        reqTodoId,
        reqUserId,
        reqUpdateTodoTargetDurationDto,
      );
    });
  });

  describe('remove', () => {
    it('正常系: 受け取った値を、Serviceにそのまま渡していること', async () => {
      await controller.remove(reqTodoId, reqUserId);

      expect(serviceMock.remove).toHaveBeenCalledWith(reqTodoId, reqUserId);
    });
  });

  describe('startTimer', () => {
    it('正常系: 受け取った値を、Serviceにそのまま渡していること', async () => {
      await controller.startTimer(reqTodoId, reqUserId);

      expect(serviceMock.startTimer).toHaveBeenCalledWith(reqTodoId, reqUserId);
    });

    it('正常系: Serviceの戻り値を、無加工のまま返していること', async () => {
      const retVal = { id: 'todo-A' };
      serviceMock.startTimer.mockResolvedValueOnce(retVal);

      const result = await controller.startTimer(reqTodoId, reqUserId);

      expect(result).toEqual(retVal);
    });
  });

  describe('complete', () => {
    it('正常系: 受け取った値を、Serviceにそのまま渡していること', async () => {
      await controller.complete(reqTodoId, reqUserId);

      expect(serviceMock.complete).toHaveBeenCalledWith(reqTodoId, reqUserId);
    });

    it('正常系: Serviceの戻り値を、無加工のまま返していること', async () => {
      const retVal = [{ id: 'node-1' }, { id: 'node-2' }];
      serviceMock.complete.mockResolvedValueOnce(retVal);

      const result = await controller.complete(reqTodoId, reqUserId);

      expect(result).toEqual(retVal);
    });
  });
});
