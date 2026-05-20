import { apiClient } from "../../../api/client";

export type Todo = {
  id: string;
  title: string;
  targetDuration?: number;
};

export const getTodos = async (): Promise<Todo[]> => {
  const res = await apiClient("/todos");
  if (!res.ok) throw new Error("Failed to fetch todos");
  return res.json();
};