import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { signIn } from "./signIn";
import { signUp } from "./signUp";
import { signOut } from "./signOut";
import { fetchMe } from "./fetchMe";
import { queryKeys } from "../../../api/queryKeys";

export const useMe = () => {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: fetchMe,
    retry: false,
  });
};

export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
    onError: (e) => {
      alert(e.message || "エラーが発生しました。");
    },
  });
};

export const useSignUp = () => {
  return useMutation({
    mutationFn: signUp,
    onError: (e) => {
      alert(e.message || "エラーが発生しました。");
    },
  });
};

export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => queryClient.clear(), // クエリデータ削除
    onError: (e) => {
      alert(e.message || "エラーが発生しました。");
    },
  });
};
