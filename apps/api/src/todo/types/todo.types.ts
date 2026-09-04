import { TodoData } from '@algarden/shared';
import { Todo, TodoScore } from 'generated/prisma/client';
import { Assert, Jsonify } from 'src/common/types/contract.types';

export type Score = {
  rank?: TodoScore;
  nodeCount: number;
};

export type CompleteTodo = {
  startedAt: Date;
  completedAt: Date;
  targetDuration: number | null;
};

// 共通型とのtypecheck
export type TodoContract = Assert<TodoData, Jsonify<Todo>>;
