import { apiClient } from "../../../api/client";
import type { CreateTodoInput } from "../todoSchema";

export const createTodo = async (props: CreateTodoInput): Promise<void> => {
  const res = await apiClient("/todos", {
    method: "POST",
    body: JSON.stringify(props),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to create todo");
  }
};
