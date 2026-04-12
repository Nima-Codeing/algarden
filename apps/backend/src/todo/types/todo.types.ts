import { GrowthStage, Prisma, TodoScore } from 'generated/prisma/client';

export type Score = {
  rank?: TodoScore;
  nodeCount: number;
};

export type CreatedNode = {
  hue: number;
  size: number;
  length: number;
  depth: number;
  parentId: string;
  todoId: string;
  plantId: string;
};

export type CompleteTodo = {
  startedAt: Date;
  completedAt: Date;
  targetDuration: number | null;
};

export type PlantWithNode = Prisma.PlantGetPayload<{
  include: { plantNodes: true };
}>;

export type GrowthStageResult = {
  curStage: GrowthStage;
  isPromotion: boolean;
};
