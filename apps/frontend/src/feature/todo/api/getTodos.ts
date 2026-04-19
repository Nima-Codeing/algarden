export type Todo = {
  id: string;
  title: string;
  targetDuration?: number;
};

export const getTodos = async (): Promise<Todo[]> => {
  const res = await fetch("http://localhost:3000/todos");
  if (!res.ok) throw new Error("Failed to fetch todos");
  return res.json();
};