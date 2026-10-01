import { apiClient } from "../../../api/client";
import type { EditTodoInput } from "../todoSchema";

type RequestEditTitle = {
  id: string;
  title: EditTodoInput["title"];
};

type RequestEditDuration = {
  id: string;
  targetDuration: EditTodoInput["targetDuration"];
};

export const updateTodoTitle = async ({
  id,
  title,
}: RequestEditTitle): Promise<void> => {
  const res = await apiClient(`/todos/${id}/title`, {
    method: "PUT",
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to update todo");
  }
};

export const updateTodoTargetDuration = async ({
  id,
  targetDuration,
}: RequestEditDuration): Promise<void> => {
  const res = await apiClient(`/todos/${id}/target-duration`, {
    method: "PUT",
    body: JSON.stringify({ targetDuration }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to update todo");
  }
};
