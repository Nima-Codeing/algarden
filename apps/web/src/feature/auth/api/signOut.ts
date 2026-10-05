import { apiClient } from "../../../api/client";

export const signOut = async (): Promise<void> => {
  const res = await apiClient("/auth/signout", {
    method: "POST",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to signout");
  }
};
