import { useState } from "react";
import { useNavigate } from "react-router";
import { apiClient } from "../api/client";

export const SigninPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSignIn = async () => {
    try {
      const signinRes = await apiClient("/auth/signin", {
        method: "POST",
        body: JSON.stringify({ email: email, password: password }),
      });

      if (!signinRes.ok) return;

      navigate("/");
    } catch {
      return;
    }
  };

  return (
    <>
      <p>Welcome to Signin Page</p>

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
        className="border bg-blue-500 active:bg-blue-700"
        onClick={handleSignIn}
      >
        SignIn
      </button>
    </>
  );
};
