import { Injectable } from '@nestjs/common';

@Injectable()
export class RandomService {
  /**
   * min以上max未満のランダムな小数を返す
   *
   * @param {number} min - 最小値(含む)
   * @param {number} max - 最大値(含まない)
   * @returns {number} min以上max未満のランダムな小数
   * @throws {Error} minがmaxより大きい場合
   */
  between(min: number, max: number): number {
    if (min > max) {
      throw new Error('最小値は最大値未満である必要があります');
    }
    return Math.random() * (max - min) + min;
  }

  /**
   * probの確率でtrueを返す
   *
   * @param {number} prob 判定がtrueになる確率（0.0 以上 1.0 以下の数値）
   * @returns {boolean} 確率を満たした場合はtrue、そうでない場合はfalse
   *
   * @example
   * // 30% の確率で true を返す
   * const isSuccess = this.randomService.withChance(0.3);
   */
  withChance(prob: number): boolean {
    return Math.random() < prob;
  }
}
