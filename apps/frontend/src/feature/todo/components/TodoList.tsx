import { Card } from "../../../components/ui/Card";
import type { Todo } from "../api/getTodos";
import { TodoItem } from "./TodoItem";

type Props = {
  todos: Todo[];
};

export const TodoList = ({ todos }: Props) => {
  return (
    <Card>
      {todos.map((todo: Todo) => {
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
