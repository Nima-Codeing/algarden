import { apiClient } from "../../../api/client";
import type { GardenData } from "@algarden/shared";

export const getGarden = async (): Promise<GardenData> => {
  const res = await apiClient("/gardens");
  if (!res.ok) throw new Error("Failed to fetch garden");
  return res.json();
};
