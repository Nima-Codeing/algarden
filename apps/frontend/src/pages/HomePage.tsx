import { useEffect, useState } from "react";
import { TodoList } from "../feature/todo/components/TodoList";
import { getTodos, type Todo } from "../feature/todo/api/getTodos";

export const HomePage = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    getTodos().then(setTodos);
  }, []);

  return (
    <div className="flex item-center margin-auto">
      <TodoList todos={todos} />
    </div>
  );
};
