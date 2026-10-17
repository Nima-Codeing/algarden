import { useState } from "react";
import { Link, Navigate } from "react-router";

import { MainLayout } from "../layouts/MainLayout";
import { Text } from "../components/ui/atoms/Text";
import { Card } from "../components/ui/atoms/Card";
import { Header } from "../components/ui/organisms/Header";
import { signInUserSchema } from "../feature/auth/authSchema";
import { useMe, useSignIn } from "../feature/auth/api/queries";
import { TitleInput } from "../components/ui/molecules/TitleInput";
import type { RequestSignIn } from "../feature/auth/api/signIn";
import { Button } from "../components/ui/atoms/Button";

export const SigninPage = () => {
  const { isPending, isSuccess } = useMe();
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
            <form onSubmit={handleSignIn}>
              <TitleInput
                id="email"
                label="Email"
                value={email}
                type="email"
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
                disabled={signInMutation.isPending}
              >
                <Text>SignIn</Text>
              </Button>
              <div className="flex flex-row items-center justify-between mx-4 mt-4">
                <Text className="text-sm">
                  Is this your first time at AlGarden?
                </Text>
                <Link to="/signup" className="text-blue-500">
                  <Text className="text-sm hover:border-b">SignUp</Text>
                </Link>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};
