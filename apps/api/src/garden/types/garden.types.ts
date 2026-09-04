import { GardenData } from '@algarden/shared';
import { Prisma } from 'generated/prisma/client';
import { Assert, Jsonify } from 'src/common/types/contract.types';

export type GardenWithPlants = Prisma.GardenGetPayload<{
  include: {
    plants: {
      include: {
        plantNodes: true;
        plantEdges: true;
      };
    };
  };
}>;

// 共通型とのtypecheck
export type GardenContract = Assert<GardenData, Jsonify<GardenWithPlants>>;
