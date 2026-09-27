import { TodoList } from "../feature/todo/components/TodoList";
import { GardenCanvas } from "../feature/garden/components/GardenCanvas";
import { useMe } from "../feature/auth/api/queries";
import { Text } from "../components/ui/atoms/Text";

export const HomePage = () => {
  const { data: user } = useMe();

  return (
    <div className="h-full w-full">
      <div className="flex justify-end w-full px-4 py-4">
        <Text className="text-right">{`user: ${user?.name}`}</Text>
      </div>
      <div className="grid grid-cols-2 place-items-center w-full h-full">
        <div className="flex flex-col justify-start pl-4 w-full h-full">
          <TodoList />
        </div>
        <div className="flex justify-center w-full h-full">
          <GardenCanvas />
        </div>
      </div>
    </div>
  );
};
