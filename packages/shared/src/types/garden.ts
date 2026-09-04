import type { PlantData } from './plant';

export type GardenPeriod = 'MONTHLY';

export interface GardenData {
  id: string;
  isActive: boolean;
  periodType: GardenPeriod;
  plants: PlantData[];
}