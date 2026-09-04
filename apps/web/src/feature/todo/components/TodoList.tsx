import type { TodoData } from "@algarden/shared";
import { Card } from "../../../components/ui/Card";
import { TodoItem } from "./TodoItem";

type Props = {
  todos: TodoData[];
};

export const TodoList = ({ todos }: Props) => {
  return (
    <Card>
      {todos.map((todo: TodoData) => {
        return (
          <TodoItem
            key={todo.id}
            title={todo.title}
            targetDuration={todo.targetDuration}
          />
        );
      })}
    </Card>
  );
};
