import { useState } from "react";
import { useNavigate } from "react-router";
import { apiClient } from "../api/client";

export const SignupPage = () => {
  const navigate = useNavigate();

  const [inputName, setInputName] = useState<string>("");
  const [inputEmail, setInputEmail] = useState<string>("");
  const [inputPassword, setInputPassword] = useState<string>("");

  const handleSignUp = async () => {
    try {
      const res = await apiClient("auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: inputName,
          email: inputEmail,
          password: inputPassword,
        }),
      });

      if (!res.ok) return;

      navigate("/signin");
    } catch {
      return;
    }
  };

  return (
    <>
      <p>welcome to Signup Page</p>

      <input
        type="text"
        value={inputName}
        placeholder="Name"
        onChange={(e) => setInputName(e.target.value)}
      />
      <input
        type="email"
        value={inputEmail}
        placeholder="Email"
        onChange={(e) => setInputEmail(e.target.value)}
      />
      <input
        type="password"
        value={inputPassword}
        placeholder="Password"
        onChange={(e) => setInputPassword(e.target.value)}
      />

      <button onClick={handleSignUp}>SignUp</button>
    </>
  );
};
