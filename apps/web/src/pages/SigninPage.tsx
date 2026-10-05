import { useState } from "react";
import { Navigate } from "react-router";

import { useMe, useSignIn } from "../feature/auth/api/queries";
import type { RequestSignIn } from "../feature/auth/api/signIn";
import { Text } from "../components/ui/atoms/Text";
import { signInUserSchema } from "../feature/auth/authSchema";

export const SigninPage = () => {
  const { isSuccess } = useMe();
  const signInMutation = useSignIn();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSignIn = (e: React.SubmitEvent) => {
    e.preventDefault();

    const res = signInUserSchema.safeParse({ email, password });
    if (!res.success) {
      const errorMessages = res.error.issues
        .map((err) => err.message)
        .join("\n");
      alert(errorMessages);
      return;
    }
    signInMutation.mutate(res.data satisfies RequestSignIn);
  };

  if (isSuccess) return <Navigate to="/" replace />;

  return (
    <form onSubmit={handleSignIn}>
      <Text>Welcome to Signin Page</Text>
      <input
        type="email"
        value={email}
        placeholder="Email"
        onChange={(e) => {
          setEmail(e.target.value);
        }}
      />
      <input
        type="password"
        value={password}
        placeholder="Password"
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      />
      <button
        type="submit"
        className="border bg-blue-500 active:bg-blue-700"
        disabled={signInMutation.isPending}
      >
        <Text>SignIn</Text>
      </button>
    </form>
  );
};
