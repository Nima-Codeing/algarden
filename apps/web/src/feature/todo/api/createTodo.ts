import { apiClient } from "../../../api/client";

interface Props {
  title: string;
  targetDuration?: number;
}

export const createTodo = async ({ title, targetDuration }: Props) => {
  const value = targetDuration ? { title, targetDuration } : { title };

  const res = await apiClient("/todos", {
    method: "POST",
    body: JSON.stringify(value),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to create todo");
  }
  return res.json();
};
