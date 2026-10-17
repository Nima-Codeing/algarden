import { useState } from "react";

import { Button } from "../components/ui/atoms/Button";
import { useSignUp } from "../feature/auth/api/queries";
import { signUpSchema } from "../feature/auth/authSchema";
import type { RequestSignUp } from "../feature/auth/api/signUp";

export const SignupPage = () => {
  const signUpMutation = useSignUp();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSignUp = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const res = signUpSchema.safeParse({
      name,
      email,
      password,
    });
    if (!res.success) {
      const errorMessages = res.error.issues
        .map((err) => err.message)
        .join("\n");
      alert(errorMessages);
      return;
    }
    signUpMutation.mutate(res.data satisfies RequestSignUp);
  };

  return (
    <form onSubmit={handleSignUp}>
      <input
        type="text"
        value={name}
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        value={email}
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit">SignUp</Button>
    </form>
  );
};
