import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../api/queryKeys";
import { getTodos } from "./getTodos";
import { completeTodo } from "./completeTodo";
import { startTodo } from "./startTodo";

export const useTodos = () =>
  useQuery({
    queryKey: queryKeys.todos,
    queryFn: getTodos,
  });

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
