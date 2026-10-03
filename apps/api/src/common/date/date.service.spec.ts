import { Test, TestingModule } from '@nestjs/testing';
import { DateService } from './date.service';

describe('DateService', () => {
  let service: DateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DateService],
    }).compile();

    service = module.get<DateService>(DateService);
  });

  describe('getNextMonthFirstDayUTC', () => {
    it('月末31日 -> 翌月1日', () => {
      const endOfDec = new Date(Date.UTC(2026, 0, 31, 0, 0, 0, 0));

      const res = service.getNextMonthFirstDayUTC(endOfDec);

      expect(res).toEqual(new Date(Date.UTC(2026, 1, 1, 0, 0, 0, 0)));
    });

    it('12月 -> 翌年1月1日', () => {
      const endOfDec = new Date(Date.UTC(2026, 11, 31, 0, 0, 0, 0));

      const res = service.getNextMonthFirstDayUTC(endOfDec);

      expect(res).toEqual(new Date(Date.UTC(2027, 0, 1, 0, 0, 0, 0)));
    });
  });
});
