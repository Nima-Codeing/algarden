import { Card } from "../../../components/ui/atoms/Card";
import { TodoItem } from "./TodoItem";
import {
  useCompleteTodo,
  useCreateTodo,
  useStartTodo,
  useTodos,
} from "../api/queries";
import { Stack } from "../../../components/ui/atoms/Stack";
import { Separator } from "../../../components/ui/atoms/Separator";
import { TodoCreationForm } from "./TodoCreationForm";
import { Text } from "../../../components/ui/atoms/Text";

export const TodoList = () => {
  const { data: todos, isPending, isError } = useTodos();
  const startMutation = useStartTodo();
  const completeMutation = useCompleteTodo();
  const createMutation = useCreateTodo();

  if (isPending) return <Text>loading...</Text>;
  if (isError) return <Text>Failed to load todos.</Text>;

  return (
    <Card variant="rounded" className="border-1 border-mist-700 shadow-lg">
      <Stack direction="col">
        {todos.map((todo) => (
          <li key={todo.id}>
            <Card className="py-2">
              <TodoItem
                key={todo.id}
                title={todo.title}
                targetDuration={todo.targetDuration}
                isCompleted={todo.isCompleted}
                onComplete={() => completeMutation.mutate(todo.id)}
                onStart={() => startMutation.mutate(todo.id)}
              />
            </Card>
            <Separator />
          </li>
        ))}

        <li>
          <Card className="py-2">
            <TodoCreationForm createMutation={createMutation} />
          </Card>
        </li>
      </Stack>
    </Card>
  );
};
