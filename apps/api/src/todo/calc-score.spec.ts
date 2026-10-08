import { TodoScore } from 'generated/prisma/client';
import { calcScore } from './calc-score';
import { CompleteTodo } from './types/todo.types';

describe('calcScore', () => {
  const scoreS = { rank: TodoScore.S, nodeCount: 5 };
  const scoreA = { rank: TodoScore.A, nodeCount: 4 };
  const scoreB = { rank: TodoScore.B, nodeCount: 3 };
  const scoreC = { rank: TodoScore.C, nodeCount: 2 };
  const scoreD = { rank: TodoScore.D, nodeCount: 1 };
  const scoreN = { rank: null, nodeCount: 1 };

  // 境界（5% / 10% / 25% / 50%）がちょうど整数秒になる目標時間
  const TARGET = 1000;

  const createTodo = (
    spentSeconds: number,
    targetDuration: number | null = TARGET,
  ): CompleteTodo => {
    const startedAt = new Date('2026-10-01T00:00:00Z');
    return {
      startedAt,
      completedAt: new Date(startedAt.getTime() + spentSeconds * 1000),
      targetDuration,
    };
  };

  it.each([
    [1501, scoreD], // 目標時間 +50% 超
    [1500, scoreC], // 目標時間 +50% ちょうど
    [1251, scoreC], // 目標時間 +25% 超
    [1250, scoreB], // 目標時間 +25% ちょうど
    [1101, scoreB], // 目標時間 +10% 超
    [1100, scoreA], // 目標時間 +10% ちょうど
    [1051, scoreA], // 目標時間 +5% 超
    [1050, scoreS], // 目標時間 +5% ちょうど
    [1000, scoreS], // 目標時間 0%
    [950, scoreS], // 目標時間 -5% ちょうど
    [949, scoreA], // 目標時間 -5% 超
    [900, scoreA], // 目標時間 -10% ちょうど
    [899, scoreB], // 目標時間 -10% 超
    [750, scoreB], // 目標時間 -25% ちょうど
    [749, scoreC], // 目標時間 -25% 超
    [500, scoreC], // 目標時間 -50% ちょうど
    [499, scoreD], // 目標時間 -50% 超
  ])('正常系: %i秒作業すると %o になる', (spent, expected) => {
    expect(calcScore(createTodo(spent))).toEqual(expected);
  });

  it('正常系: 目標時間が未設定なら、ランクなしでノード1個', () => {
    expect(calcScore(createTodo(500, null))).toEqual(scoreN);
  });
});
