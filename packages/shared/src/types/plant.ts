export type PlantEdgeType = "SKELETON" | "SPREAD";

export interface PlantData {
  id: string;
  seed: SeedData;
  plantNodes: PlantNodeData[];
  plantEdges: PlantEdgeData[];
}

export interface PlantNodeData {
  id: string;
  x: number;
  y: number;
  hue: number;
  size: number;
  parentId: string | null;
  createdAt: string; // Nodeフォーカス時に表示
}

export interface PlantEdgeData {
  id: string;
  fromId: string;
  toId: string;
  edgeType: PlantEdgeType;
}

// NOTE: gardenに植えられているSeedへの使用のみ
export interface SeedData {
  x: number | null;
  y: number | null;
}
