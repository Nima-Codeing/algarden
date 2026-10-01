import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../api/queryKeys";
import { getTodos } from "./getTodos";
import { completeTodo } from "./completeTodo";
import { startTodo } from "./startTodo";
import { createTodo } from "./createTodo";
import type { TodoData } from "@algarden/shared";
import { updateTodoTargetDuration, updateTodoTitle } from "./updateTodo";

const toTodoView = (todos: TodoData[]) =>
  todos.map((todo) => ({
    ...todo,
    // フロントでは 秒 -> 分 に変えて扱う
    targetDurationMinutes: todo.targetDuration
      ? Math.floor(todo.targetDuration / 60)
      : null,
  }));

export const useTodos = () =>
  useQuery({
    queryKey: queryKeys.todos,
    queryFn: getTodos,
    select: toTodoView,
  });

export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos });
    },
    onError: (e) => {
      alert(e.message || "エラーが発生しました。");
    },
  });
};

export const useUpdateTodoTitle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTodoTitle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos });
    },
    onError: (e) => {
      alert(e.message || "エラーが発生しました。");
    },
  });
};

export const useUpdateTodoTargetDuration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTodoTargetDuration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos });
    },
    onError: (e) => {
      alert(e.message || "エラーが発生しました。");
    },
  });
};

export const useStartTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos });
    },
    onError: (e) => {
      alert(e.message || "エラーが発生しました。");
    },
  });
};

export const useCompleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos });
      queryClient.invalidateQueries({ queryKey: queryKeys.gardens });
    },
    onError: (e) => {
      alert(e.message || "エラーが発生しました。");
    },
  });
};
