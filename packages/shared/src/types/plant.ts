export type GrowthStage = 'SPROUT' | 'YOUNG' | 'MATURE' | 'BLOOM';

export type SeedType = 'TENDRIL';

export type MutationType = 'OCTAHEDRON' | 'RADIAL';

export interface PlantNodeData {
  id: string;
  hue: number;
  size: number;
  depth: number;
  angle: number | null;
  length: number | null;
  mutationType: MutationType | null;
  mutationProgress: number;
  mutationBlueprint: unknown | null;
  canSpawn: boolean;
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
}
