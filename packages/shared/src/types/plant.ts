export interface PlantData {
  id: string;
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
}
