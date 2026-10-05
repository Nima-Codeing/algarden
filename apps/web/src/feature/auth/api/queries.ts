import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { signIn } from "./signIn";
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
