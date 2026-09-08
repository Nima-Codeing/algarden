import type { TodoData } from "@algarden/shared";
import { apiClient } from "../../../api/client";

export const getTodos = async (): Promise<TodoData[]> => {
  const res = await apiClient("/todos");
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to fetch todos");
  }
  return res.json();
};
