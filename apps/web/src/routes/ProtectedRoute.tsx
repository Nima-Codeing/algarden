import { Navigate, Outlet } from "react-router";
import { useMe } from "../feature/auth/api/queries";

export const ProtectedRoute = () => {
  const { isPending, isError } = useMe();

  if (isPending) return <p>loading...</p>;
  if (isError) return <Navigate to="/signin" replace />;

  return <Outlet />;
};
