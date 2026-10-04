import { Test, TestingModule } from '@nestjs/testing';
import { GardenService } from './garden.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { DateService } from 'src/common/date/date.service';
import { PlantService } from 'src/plant/plant.service';
import { Prisma } from 'generated/prisma/client';
import { gardenSelect } from './types/garden.types';

describe('GardenService', () => {
  let service: GardenService;

  const END_AT = new Date('2026-11-01T00:00:00Z');

  const dateMock = {
    getNextMonthFirstDayUTC: jest.fn(),
  };
  const plantMock = {
    plantRoot: jest.fn(),
  };
  const prismaMock = {
    garden: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    seed: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    dateMock.getNextMonthFirstDayUTC.mockReturnValue(END_AT);
    prismaMock.$transaction.mockImplementation(
      (cb: (tx: typeof prismaMock) => unknown) => cb(prismaMock),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GardenService,
        { provide: DateService, useValue: dateMock },
        { provide: PlantService, useValue: plantMock },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<GardenService>(GardenService);
  });

  describe('getActive', () => {
    it('対象期間の庭が存在する場合、新規作成せずそれを返す', async () => {
      const mockGarden = { id: 'garden1' };
      prismaMock.garden.findUnique.mockResolvedValue(mockGarden);

      const res = await service.getActive('user1');

      expect(res).toEqual(mockGarden);
      expect(prismaMock.garden.findUnique).toHaveBeenCalledWith({
        select: gardenSelect,
        where: {
          userId_endAt: {
            userId: 'user1',
            endAt: END_AT,
          },
        },
      });
      expect(prismaMock.garden.create).toHaveBeenCalledTimes(0);
    });

    it('庭が無い場合、Garden・Seed・ルートノードを1トランザクションで作る', async () => {
      prismaMock.garden.findUnique.mockImplementation(() => null);
      prismaMock.garden.create.mockResolvedValue({ id: 'garden1' });
      prismaMock.seed.create.mockResolvedValue({ id: 'seed1' });

      await service.getActive('user1');

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaMock.garden.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.garden.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          endAt: END_AT,
        },
      });
      expect(prismaMock.seed.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.seed.create).toHaveBeenCalledWith({
        data: {
          gardenId: 'garden1',
        },
      });
      expect(plantMock.plantRoot).toHaveBeenCalledTimes(1);
      expect(plantMock.plantRoot).toHaveBeenCalledWith(
        expect.anything(),
        'garden1',
        'seed1',
        0,
        0,
      );
      expect(prismaMock.garden.findUniqueOrThrow).toHaveBeenCalledTimes(1);
    });

    it('一意制約違反になった場合、再取得した庭を返す', async () => {
      prismaMock.garden.findUnique.mockImplementation(() => null);
      prismaMock.garden.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Already exists', {
          code: 'P2002',
          clientVersion: '11.x',
        }),
      );

      await service.getActive('user1');

      expect(prismaMock.garden.findUniqueOrThrow).toHaveBeenCalledTimes(1);
    });
  });
});
