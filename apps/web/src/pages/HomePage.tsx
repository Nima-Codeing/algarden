import { TodoList } from "../feature/todo/components/TodoList";
import { GardenCanvas } from "../feature/garden/components/GardenCanvas";
import { useMe } from "../feature/auth/api/queries";

export const HomePage = () => {
  const { data: user } = useMe();

  return (
    <>
      <p>{`user: ${user?.name}`}</p>
      <TodoList />
      <GardenCanvas />
    </>
  );
};
