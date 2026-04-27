import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";

type Status = "loading" | "ok" | "ng";

export const ProtectedRoute = () => {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    const fetchMe = async () => {
      try {
        await fetch("http://localhost:3000/auth/me", {
          credentials: "include",
        });
        setStatus("ok");
      } catch {
        setStatus("ng");
      }
    };
    fetchMe();
  }, []);

  if (status === "loading") return null;
  if (status === "ng") return <Navigate to="/signin" />;
  return <Outlet />;
};
