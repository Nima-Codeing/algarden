import { TodoScore } from 'generated/prisma/client';
import { CompleteTodo, Score } from './types/todo.types';

/**
 * Todoの作業時間と目標時間の差分率からスコアランクとノード生成数を算出する
 *
 * @param {CompleteTodo} completeTodo - 完了するTodo
 * @returns {Score} スコアランクと生成するノード数
 */
export const calcScore = (completeTodo: CompleteTodo): Score => {
  const { startedAt, completedAt, targetDuration } = completeTodo;

  // 目標時間が未設定の場合はスコアなしでノード1個
  if (!targetDuration) return { rank: null, nodeCount: 1 };

  // 作業時間(秒)
  const timeSpent: number =
    (completedAt.getTime() - startedAt.getTime()) / 1000;

  // 目標値と実値の差分率
  const dissociationRate: number =
    Math.abs(timeSpent - targetDuration) / targetDuration;

  if (dissociationRate <= 0.05) {
    return { rank: TodoScore.S, nodeCount: 5 };
  } else if (dissociationRate <= 0.1) {
    return { rank: TodoScore.A, nodeCount: 4 };
  } else if (dissociationRate <= 0.25) {
    return { rank: TodoScore.B, nodeCount: 3 };
  } else if (dissociationRate <= 0.5) {
    return { rank: TodoScore.C, nodeCount: 2 };
  } else {
    return { rank: TodoScore.D, nodeCount: 1 };
  }
};
