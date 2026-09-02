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
      x: 0,
      y: 0,
      hue: 120,
      size: 50,
      depth: 0,
      parentId: null,
      todoId: null,
      plantId: "plantId-0",
      createdAt: "",
    },
    {
      // root child node 1
      id: "nodeId-1",
      x: 0,
      y: 50,
      hue: 100,
      size: 30,
      depth: 1,
      parentId: "nodeId-0",
      todoId: null,
      plantId: "plantId-0",
      createdAt: "",
    },
    {
      // root child node 2
      id: "nodeId-2",
      x: 50,
      y: 100,
      hue: 80,
      size: 50,
      depth: 1,
      parentId: "nodeId-0",
      todoId: null,
      plantId: "plantId-0",
      createdAt: "",
    },
  ],
  plantEdges: [],
};
