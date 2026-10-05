import type { UserData } from "@algarden/shared";
import { apiClient } from "../../../api/client";

export const fetchMe = async (): Promise<UserData> => {
  const res = await apiClient("/auth/me");
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to fetch user");
  }
  return res.json();
};
