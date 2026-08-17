export type GrowthStage = 'SPROUT' | 'YOUNG' | 'MATURE' | 'BLOOM';

export type SeedType = 'TENDRIL';

export interface PlantNodeData {
  id: string;
  hue: number;
  size: number;
  depth: number;
  angle: number | null;
  length: number | null;
  parentId: string | null;
  todoId: string | null;
  plantId: string;
  createdAt: string;
}

export interface PlantData {
  id: string;
  growthStage: GrowthStage;
  nodeCount: number;
  seedId: string;
  gardenId: string;
  plantNodes: PlantNodeData[];
  plantEdges: PlantEdgeData[];
}

export interface PlantEdgeData {
  id: string;
  plantId: string;
  fromId: string;
  toId: string;
  createdAt: string;
}