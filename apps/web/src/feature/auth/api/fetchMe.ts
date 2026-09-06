import type { UserData } from "@algarden/shared";
import { apiClient } from "../../../api/client";

export const fetchMe = async (): Promise<UserData> => {
  const res = await apiClient("/auth/me");
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
};
