import { TodoList } from "../feature/todo/components/TodoList";
import { GardenCanvas } from "../feature/garden/components/GardenCanvas";
import { useMe, useSignOut } from "../feature/auth/api/queries";
import { Text } from "../components/ui/atoms/Text";
import { Button } from "../components/ui/atoms/Button";
import { useNavigate } from "react-router";

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
    <div className="h-full w-full flex flex-col">
      <div className="flex justify-end w-full px-4 py-4">
        <Text className="text-right">{`user: ${user?.name}`}</Text>
        <Button onClick={handleSignOut} disabled={signOutMutation.isPending}>
          <Text>Sign-out</Text>
        </Button>
      </div>
      <div className="grid grid-cols-5 place-items-center w-full flex-1 min-h-0">
        <div className="col-span-2 flex flex-col justify-start pl-4 py-4 w-full h-full min-h-0">
          <TodoList />
        </div>
        <div className="col-span-3 flex justify-center w-full h-full">
          <GardenCanvas />
        </div>
      </div>
    </div>
  );
};
