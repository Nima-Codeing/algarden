import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from './todo.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GardenService } from 'src/garden/garden.service';
import { PlantService } from 'src/plant/plant.service';

describe('TodoService', () => {
  let service: TodoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        { provide: PrismaService, useValue: {} },
        { provide: GardenService, useValue: {} },
        { provide: PlantService, useValue: {} },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
