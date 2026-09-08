import { Card } from "../../../components/ui/Card";
import { TodoItem } from "./TodoItem";
import { useCompleteTodo, useStartTodo, useTodos } from "../api/queries";

export const TodoList = () => {
  const { data: todos, isPending, isError } = useTodos();
  const startMutation = useStartTodo();
  const completeMutation = useCompleteTodo();

  if (isPending) return <p>loading...</p>;
  if (isError) return <p>Failed to load todos.</p>;

  return (
    <Card>
      {todos.map((todo) => {
        return (
          <TodoItem
            key={todo.id}
            title={todo.title}
            targetDuration={todo.targetDuration}
            isCompleted={todo.isCompleted}
            onComplete={() => completeMutation.mutate(todo.id)}
            onStart={() => startMutation.mutate(todo.id)}
          />
        );
      })}
    </Card>
  );
};
