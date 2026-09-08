import { GardenData } from '@algarden/shared';
import { Prisma } from 'generated/prisma/client';
import { Assert, Jsonify } from 'src/common/types/contract.types';
import { plantSelect } from 'src/plant/types/plant.types';

export const gardenSelect = {
  id: true,
  plants: { select: plantSelect },
} satisfies Prisma.GardenSelect;

// フロントに送るデータ
export type GardenWithPlants = Prisma.GardenGetPayload<{
  select: typeof gardenSelect;
}>;

// 共通型の項目が不足していないか
export type GardenContract = Assert<GardenData, Jsonify<GardenWithPlants>>;

// 共通型にない項目を余分に転送していないか
export type GardenContractNoExcess = Assert<
  Jsonify<GardenWithPlants>,
  GardenData
>;
