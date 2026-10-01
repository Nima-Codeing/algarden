import { apiClient } from "../../../api/client";

export const deleteTodo = async (id: string): Promise<void> => {
  const res = await apiClient(`/todos/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to delete todo");
  }
};
