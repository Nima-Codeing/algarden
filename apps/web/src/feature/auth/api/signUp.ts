import { apiClient } from "../../../api/client";

export type RequestSignUp = {
  name: string;
  email: string;
  password: string;
};

export const signUp = async ({
  name,
  email,
  password,
}: RequestSignUp): Promise<void> => {
  const res = await apiClient("/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to signup");
  }
};
