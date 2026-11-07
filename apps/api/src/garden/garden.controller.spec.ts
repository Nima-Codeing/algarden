import { Test, TestingModule } from '@nestjs/testing';
import { GardenController } from './garden.controller';
import { GardenService } from './garden.service';

describe('GardenController', () => {
  let controller: GardenController;

  const serviceMock = {
    findOrCreateActive: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GardenController],
      providers: [{ provide: GardenService, useValue: serviceMock }],
    }).compile();

    controller = module.get<GardenController>(GardenController);
  });

  describe('findActive', () => {
    it('正常系: 受け取った値を、Serviceにそのまま渡していること', async () => {
      const userId = 'user-1';

      await controller.findActive(userId);

      expect(serviceMock.findOrCreateActive).toHaveBeenCalledWith(userId);
    });

    it('正常系: Serviceの戻り値を、無加工のまま返していること', async () => {
      const userId = 'user-1';
      const retVal = { id: 'garden-1' };
      serviceMock.findOrCreateActive.mockResolvedValueOnce(retVal);

      const result = await controller.findActive(userId);

      expect(result).toEqual(retVal);
    });
  });
});
