import type { PlantData } from "@algarden/shared";

export const mockPlant: PlantData = {
  id: "plantId-0",
  growthStage: "SPROUT",
  nodeCount: 1,
  seedId: "seedId-0",
  gardenId: "gardenId-0",
  plantNodes: [
    {
      // root node
      id: "nodeId-0",
      hue: 120,
      size: 50,
      depth: 0,
      angle: null,
      length: null,
      parentId: null,
      todoId: null,
      plantId: "plantId-0",
      createdAt: "",
    },
    {
      // root child node 1
      id: "nodeId-1",
      hue: 100,
      size: 30,
      depth: 1,
      angle: Math.PI / 2,
      length: 50,
      parentId: "nodeId-0",
      todoId: null,
      plantId: "plantId-0",
      createdAt: "",
    },
    {
      // root child node 2
      id: "nodeId-2",
      hue: 80,
      size: 50,
      depth: 1,
      angle: 3 * Math.PI / 4,
      length: 80,
      parentId: "nodeId-0",
      todoId: null,
      plantId: "plantId-0",
      createdAt: "",
    },
  ],
  plantEdges: [],
};
