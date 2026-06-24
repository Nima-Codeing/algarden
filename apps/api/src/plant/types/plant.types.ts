import { GrowthStage, Prisma } from 'generated/prisma/client';

export type CreatedNode = {
  id: string;
  hue: number;
  size: number;
  depth: number;
  angle: number;
  length: number;
  parentId: string;
  todoId: string;
  plantId: string;
};

export type PlantWithNode = Prisma.PlantGetPayload<{
  include: { plantNodes: true };
}>;

export type GrowthStageResult = {
  curStage: GrowthStage;
  isPromotion: boolean;
};
