import { useState } from "react";

import { Text } from "../../../components/ui/atoms/Text";
import { Card } from "../../../components/ui/atoms/Card";
import { Stack } from "../../../components/ui/atoms/Stack";
import { Separator } from "../../../components/ui/atoms/Separator";
import { TodoItem } from "./TodoItem";
import { TodoEditForm } from "./TodoEditForm";
import { TodoCreationForm } from "./TodoCreationForm";
import {
  useCompleteTodo,
  useCreateTodo,
  useDeleteTodo,
  useStartTodo,
  useTodos,
  useUpdateTodoTargetDuration,
  useUpdateTodoTitle,
} from "../api/queries";

type ActiveRow =
  | { type: "none" }
  | { type: "create" }
  | { type: "edit"; id: string };

export const TodoList = () => {
  const { data: todos, isPending, isError } = useTodos();

  const startMutation = useStartTodo();
  const completeMutation = useCompleteTodo();
  const createMutation = useCreateTodo();
  const titleMutation = useUpdateTodoTitle();
  const durationMutation = useUpdateTodoTargetDuration();
  const deleteMutation = useDeleteTodo();

  const [activeRow, setActiveRow] = useState<ActiveRow>({ type: "none" });

  const openCreate = () => setActiveRow({ type: "create" });
  const openEdit = (id: string) => setActiveRow({ type: "edit", id });
  const close = () => setActiveRow({ type: "none" });

  if (isPending) return <Text>loading...</Text>;
  if (isError) return <Text>Failed to load todos.</Text>;
  return (
    <Card variant="rounded" className="border-1 border-mist-700 shadow-lg">
      <Stack direction="col">
        {todos.map((todo) => (
          <li key={todo.id}>
            <Card className="py-2">
              {activeRow.type === "edit" && activeRow.id === todo.id ? (
                <TodoEditForm
                  id={todo.id}
                  title={todo.title}
                  targetDurationMinutes={todo.targetDurationMinutes}
                  isStarted={todo.startedAt !== null}
                  titleMutation={titleMutation}
                  durationMutation={durationMutation}
                  handleExitEditMode={close}
                />
              ) : (
                <TodoItem
                  title={todo.title}
                  targetDurationMinutes={todo.targetDurationMinutes}
                  isCompleted={todo.isCompleted}
                  onComplete={() => completeMutation.mutate(todo.id)}
                  onStart={() => startMutation.mutate(todo.id)}
                  onEditMode={() => openEdit(todo.id)}
                  onDelete={() => {
                    if (!window.confirm(`「${todo.title}」を削除しますか？`))
                      return;
                    close();
                    deleteMutation.mutate(todo.id);
                  }}
                />
              )}
            </Card>
            <Separator />
          </li>
        ))}

        <li>
          <Card className="py-2">
            <TodoCreationForm
              isOpen={activeRow.type === "create"}
              onOpen={openCreate}
              onClose={close}
              createMutation={createMutation}
            />
          </Card>
        </li>
      </Stack>
    </Card>
  );
};
