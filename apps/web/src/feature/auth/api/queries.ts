import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../api/queryKeys";
import { fetchMe } from "./fetchMe";

export const useMe = () =>
  useQuery({
    queryKey: queryKeys.user,
    queryFn: fetchMe,
    retry: false,
  });
