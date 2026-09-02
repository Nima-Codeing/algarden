import { GrowthStage, Prisma } from 'generated/prisma/client';

export type CreatedNode = {
  x: number;
  y: number;
  hue: number;
  size: number;
  depth: number;
  parentId: string;
  todoId: string;
  plantId: string;
};

export type PlantWithNode = Prisma.PlantGetPayload<{
  include: { plantNodes: true };
}>;

export type NodeWithChildIds = {
  id: string;
  depth: number;
  children: { id: string }[];
};

export type GrowthStageResult = {
  curStage: GrowthStage;
  isPromotion: boolean;
};
