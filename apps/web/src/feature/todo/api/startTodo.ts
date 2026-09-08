import { apiClient } from "../../../api/client";
import type { TodoData } from "@algarden/shared";

export const startTodo = async (id: string): Promise<TodoData> => {
  const res = await apiClient(`/todos/${id}/start`, {
    method: "PATCH",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to start todo");
  }
  return res.json();
};
