import { Injectable } from '@nestjs/common';

@Injectable()
export class DateService {
  /** 翌月1日 0時（UTC）を返す */
  getNextMonthFirstDayUTC(now: Date = new Date()): Date {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  }

  /** 現在日付を返す */
  now(): Date {
    return new Date();
  }
}
