import { useState } from "react";
import { useNavigate } from "react-router";

export const SignupPage = () => {
  const navigate = useNavigate();

  const [inputName, setInputName] = useState<string>("");
  const [inputEmail, setInputEmail] = useState<string>("");
  const [inputPassword, setInputPassword] = useState<string>("");

  const handleSignUp = async () => {
    try {
      const res = await fetch("http://localhost:3000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: inputName,
          email: inputEmail,
          password: inputPassword,
        }),
        credentials: "include",
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
