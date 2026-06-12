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
      mutationType: null,
      mutationProgress: 0,
      mutationBlueprint: null,
      canSpawn: true,
      parentId: null,
      todoId: null,
      plantId: "plantId-0",
      createdAt: "",
    },
  ],
  plantEdges: [],
};
