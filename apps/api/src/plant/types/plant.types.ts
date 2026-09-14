import { PlantNodeData } from '@algarden/shared';
import { GrowthStage, Prisma } from 'generated/prisma/client';
import { Assert, Jsonify } from 'src/common/types/contract.types';

/* -------------- 共有用 -------------- */
/** ----------- PlantNode ----------- **/

export const plantNodeSelect = {
  id: true,
  x: true,
  y: true,
  hue: true,
  size: true,
  parentId: true,
  createdAt: true,
} satisfies Prisma.PlantNodeSelect;

/** ----------- PlantEdge ----------- **/

export const plantEdgeSelect = {
  id: true,
  fromId: true,
  toId: true,
} satisfies Prisma.PlantEdgeSelect;

/** ------------- Plant ------------- **/

export const plantSelect = {
  id: true,
  plantNodes: { select: plantNodeSelect },
  plantEdges: { select: plantEdgeSelect },
} satisfies Prisma.PlantSelect;

// todo.complete が返す１ノード型
export type PlantNodeResponse = Prisma.PlantNodeGetPayload<{
  select: typeof plantNodeSelect;
}>;

/** ------------- Check ------------- **/
// 項目の不足チェック
export type PlantNodeContract = Assert<
  PlantNodeData,
  Jsonify<PlantNodeResponse>
>;

// 項目の余分チェック
export type PlantNodeContractNoExcess = Assert<
  Jsonify<PlantNodeResponse>,
  PlantNodeData
>;

/* ------------- ローカル ------------- */
/** ----------- PlantNode ----------- **/
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

export type NodeWithChildIds = {
  id: string;
  depth: number;
  children: { id: string }[];
};

export type NodeWithChildrens = Prisma.PlantNodeGetPayload<{
  include: {
    children: true;
  };
}>;

/** ------------- Plant ------------- **/
// 成長処理用。depthなど画面に送らない項目も必要なためinclude
export type PlantWithNodes = Prisma.PlantGetPayload<{
  include: {
    plantNodes: {
      include: {
        children: true;
      };
    };
  };
}>;

/** ------------- Other ------------- **/
export type GrowthStageResult = {
  curStage: GrowthStage;
  isPromotion: boolean;
};
