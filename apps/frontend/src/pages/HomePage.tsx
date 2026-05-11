import { useEffect, useState } from "react";
import { TodoList } from "../feature/todo/components/TodoList";
import { getTodos, type Todo } from "../feature/todo/api/getTodos";
import { useUserStore } from "../stores/authStore";

export const HomePage = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    getTodos().then(setTodos);
  }, []);

  return (
    <div className="flex item-center margin-auto">
      <p>{`user: ${user?.name}`}</p>
      <TodoList todos={todos} />
    </div>
  );
};
