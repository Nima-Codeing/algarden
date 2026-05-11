import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { useUserStore } from "../stores/authStore";

type Status = "loading" | "ok" | "ng";

export const ProtectedRoute = () => {
  const [status, setStatus] = useState<Status>("loading");
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("http://localhost:3000/auth/me", {
          credentials: "include",
        });

        // 404 ERROR
        if (!res.ok) {
          setStatus("ng");
          return;
        }

        const user = await res.json();
        setUser(user);
        setStatus("ok");
      } catch {
        setStatus("ng");
      }
    };
    fetchMe();
  }, [setUser]);

  if (status === "loading") return null;
  if (status === "ng") return <Navigate to="/signin" />;

  return <Outlet />;
};
