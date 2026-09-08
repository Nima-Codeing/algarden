import { apiClient } from "../../../api/client";
import type { PlantNodeData } from "@algarden/shared";

export const completeTodo = async (id: string): Promise<PlantNodeData[]> => {
  const res = await apiClient(`/todos/${id}/complete`, {
    method: "PATCH",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to complete todo");
  }
  return res.json();
};
