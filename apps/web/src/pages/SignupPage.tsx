import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";

import { Text } from "../components/ui/atoms/Text";
import { Card } from "../components/ui/atoms/Card";
import { Button } from "../components/ui/atoms/Button";
import { Header } from "../components/ui/organisms/Header";
import { MainLayout } from "../layouts/MainLayout";
import { TitleInput } from "../components/ui/molecules/TitleInput";
import { signUpUserSchema } from "../feature/auth/authSchema";
import { useMe, useSignUp } from "../feature/auth/api/queries";
import type { RequestSignUp } from "../feature/auth/api/signUp";

export const SignupPage = () => {
  const navigate = useNavigate();

  const { isPending, isSuccess } = useMe();
  const signUpMutation = useSignUp();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSignUp = (e: React.SubmitEvent) => {
    e.preventDefault();
    const res = signUpUserSchema.safeParse({
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
    signUpMutation.mutate(res.data satisfies RequestSignUp, {
      onSuccess: () => navigate("/signin"),
    });
  };

  if (isPending) return <Text>loading...</Text>;
  if (isSuccess) return <Navigate to="/" replace />;

  return (
    <MainLayout header={<Header />}>
      <div className="flex flex-col items-center justify-center h-full">
        <Card className="flex flex-col items-center justify-center max-w-md bg-white/10 border border-white/20 p-10">
          <div className="grid grid-cols-1 gap-10 w-full">
            <Text className="flex items-start text-lg font-semibold">
              Welcome to AlGarden
            </Text>
            <form onSubmit={handleSignUp}>
              <TitleInput
                id="name"
                label="Name"
                value={name}
                type="text"
                onChange={(e) => setName(e.target.value)}
              />
              <TitleInput
                id="email"
                label="Email"
                value={email}
                type="email"
                className="mt-6"
                onChange={(e) => setEmail(e.target.value)}
              />
              <TitleInput
                id="password"
                label="Password"
                value={password}
                type="password"
                className="mt-6"
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                className="mt-12 border border-white/20 rounded-full p-1 bg-blue-500 shadow-lg shadow-blue-500/50 hover:bg-blue-600 active:shadow-blue-700/50 disabled:hover:bg-blue-500 w-full"
                disabled={signUpMutation.isPending}
              >
                <Text>SignUp</Text>
              </Button>
              <div className="flex flex-row items-center justify-between mx-4 mt-4">
                <Text className="text-sm">Already a member?</Text>
                <Link to="/signin" className="text-blue-500">
                  <Text className="text-sm hover:border-b">SignIn</Text>
                </Link>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};
