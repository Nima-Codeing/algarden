import { apiClient } from "../../../api/client";

export type RequestSignIn = {
  email: string;
  password: string;
};

export const signIn = async ({
  email,
  password,
}: RequestSignIn): Promise<void> => {
  const res = await apiClient("/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email: email, password: password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to signin");
  }
};
