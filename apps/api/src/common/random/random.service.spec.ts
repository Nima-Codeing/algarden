import { Test, TestingModule } from '@nestjs/testing';
import { RandomService } from './random.service';

describe('RandomService', () => {
  let service: RandomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RandomService],
    }).compile();

    service = module.get<RandomService>(RandomService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // -------------------
  //  Math.random固定ヘルパー関数
  // -------------------
  const mockRandom = (value: number) => {
    jest.spyOn(Math, 'random').mockReturnValue(value);
  };

  describe('between', () => {
    it('乱数が0の場合、最小値を返す', () => {
      mockRandom(0);

      expect(service.between(2, 10)).toBe(2);
    });

    it('乱数が1に近い場合、最大値未満の値を返す', () => {
      mockRandom(0.999);

      const result: number = service.between(2, 10);

      expect(result).toBeGreaterThan(9);
      expect(result).toBeLessThan(10);
    });

    it('最小値と最大値が同じ場合、その値を返す', () => {
      mockRandom(0.5);

      expect(service.between(3, 3)).toBe(3);
    });

    it('最小値が最大値より大きい場合、例外エラーを返す', () => {
      expect(() => service.between(10, 2)).toThrow(
        '最小値は最大値未満である必要があります',
      );
    });
  });

  describe('withChance', () => {
    it('確率が1の場合、trueを返す', () => {
      mockRandom(0.999);

      expect(service.withChance(1)).toBe(true);
    });

    it('確率が0の場合、falseを返す', () => {
      mockRandom(0);

      expect(service.withChance(0)).toBe(false);
    });

    it('乱数が確率未満の場合、trueを返す', () => {
      mockRandom(0.29);

      expect(service.withChance(0.3)).toBe(true);
    });

    it('乱数が確率と同じ場合、falseを返す', () => {
      // 判定は「未満」のため、境界値は含まない
      mockRandom(0.3);

      expect(service.withChance(0.3)).toBe(false);
    });
  });
});
