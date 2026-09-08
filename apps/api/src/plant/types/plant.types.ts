import { GrowthStage, Prisma } from 'generated/prisma/client';

// フロントに送るPlantの項目。gardenSelectから参照される
export const plantSelect = {
  id: true,
  plantNodes: {
    select: {
      id: true,
      x: true,
      y: true,
      hue: true,
      size: true,
      parentId: true,
      createdAt: true,
    },
  },
  plantEdges: {
    select: {
      id: true,
      fromId: true,
      toId: true,
    },
  },
} satisfies Prisma.PlantSelect;

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

// 成長処理用。depthなど画面に送らない項目も必要なためinclude
export type PlantWithNodes = Prisma.PlantGetPayload<{
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
