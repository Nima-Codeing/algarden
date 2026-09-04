import { apiClient } from "../../../api/client";
import type { PlantNodeData } from "@algarden/shared";

export const completeTodo = async (id: string): Promise<PlantNodeData[]> => {
  const res = await apiClient(`/todos/${id}/complete`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed to fetch todo");
  return res.json();
};
