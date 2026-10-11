import { TodoList } from "../feature/todo/components/TodoList";
import { GardenCanvas } from "../feature/garden/components/GardenCanvas";
import { useMe, useSignOut } from "../feature/auth/api/queries";
import { useNavigate } from "react-router";
import { MainLayout } from "../layouts/MainLayout";
import { Header } from "../components/ui/organisms/Header";

export const HomePage = () => {
  const navigate = useNavigate();

  const { data: user } = useMe();
  const signOutMutation = useSignOut();

  const handleSignOut = () => {
    signOutMutation.mutate(undefined, {
      onSuccess: () => navigate("/signin"),
    });
  };

  return (
    <MainLayout
      header={
        <Header
          userName={user?.name}
          isPending={signOutMutation.isPending}
          handleSignOut={handleSignOut}
        />
      }
    >
      <div
        className="relative w-full h-full min-h-0"
        style={{ "--panel-w": "500px" } as React.CSSProperties}
      >
        <GardenCanvas className="absolute inset-y-0 left-0 right-[calc(var(--panel-w)+2rem)]" />
        <TodoList className="absolute top-4 right-4 bottom-4 w-(--panel-w)" />
      </div>
    </MainLayout>
  );
};
