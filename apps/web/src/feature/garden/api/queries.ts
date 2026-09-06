import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../api/queryKeys";
import { getGarden } from "./getGarden";

export const useGarden = () =>
  useQuery({
    queryKey: queryKeys.gardens,
    queryFn: getGarden,
  });
