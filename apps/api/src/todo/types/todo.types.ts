import { GrowthStage, TodoScore } from 'generated/prisma/client';

export type Score = {
  rank?: TodoScore;
  nodeCount: number;
};

export type CompleteTodo = {
  startedAt: Date;
  completedAt: Date;
  targetDuration: number | null;
};

export type GrowthStageResult = {
  curStage: GrowthStage;
  isPromotion: boolean;
};
