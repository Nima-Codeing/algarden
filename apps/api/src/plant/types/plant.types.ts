import { Prisma } from 'generated/prisma/client';

export type CreatedNode = {
  hue: number;
  size: number;
  length: number;
  depth: number;
  parentId: string;
  todoId: string;
  plantId: string;
};

export type PlantWithNode = Prisma.PlantGetPayload<{
  include: { plantNodes: true };
}>;
