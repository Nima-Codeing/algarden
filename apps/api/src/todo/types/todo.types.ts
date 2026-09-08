import { TodoData } from '@algarden/shared';
import { Prisma, TodoScore } from 'generated/prisma/client';
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

export const todoSelect = {
  id: true,
  title: true,
  isCompleted: true,
  targetDuration: true,
  score: true,
  startedAt: true,
  completedAt: true,
} satisfies Prisma.TodoSelect;

// フロントに送るデータ
export type TodoResponse = Prisma.TodoGetPayload<{
  select: typeof todoSelect;
}>;

// 共通型の項目が不足していないか
export type TodoContract = Assert<TodoData, Jsonify<TodoResponse>>;

// 共通型にない項目を余分に転送していないか
export type TodoContractNoExcess = Assert<Jsonify<TodoResponse>, TodoData>;
