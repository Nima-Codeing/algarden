import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // NOTE: 別タブ・別端末での変更やログイン切れを、タブ復帰時に反映するため
      staleTime: 0,
      refetchOnWindowFocus: true,
    },
  },
});
