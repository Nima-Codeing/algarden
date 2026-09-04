import type { TodoData } from "@algarden/shared";
import { apiClient } from "../../../api/client";

export const getTodos = async (): Promise<TodoData[]> => {
  const res = await apiClient("/todos");
  if (!res.ok) throw new Error("Failed to fetch todos");
  return res.json();
};