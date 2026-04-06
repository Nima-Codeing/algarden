export type GrowthStage = 'SPROUT' | 'YOUNG' | 'MATURE' | 'BLOOM';

export type SeedType = 'DFS';

export interface PlantNodeData {
  id: string;
  hue: number;
  size: number;
  angle: number;
  length: number;
  depth: number;
  parentId: string | null;
  plantId: string;
  todoId: string | null;
  createdAt: string;
}

export interface PlantData {
  id: string;
  growthStage: GrowthStage;
  nodeCount: number;
  seedId: string;
  gardenId: string;
  plantNodes: PlantNodeData[];
}
