import { useEffect, useState } from "react";
import { TodoList } from "../feature/todo/components/TodoList";
import { getTodos } from "../feature/todo/api/getTodos";
import { useUserStore } from "../stores/authStore";
import { GardenCanvas } from "../feature/garden/components/GardenCanvas";
import { getGarden } from "../feature/garden/api/getGarden";
import type { GardenData, TodoData } from "@algarden/shared";

export const HomePage = () => {
  const [todos, setTodos] = useState<TodoData[]>([]);
  const [garden, setGarden] = useState<GardenData>();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch((e) => {
        console.error(e);
      });
    getGarden()
      .then(setGarden)
      .catch((e) => {
        console.error(e);
      });
  }, []);

  return (
    <>
      <div className="flex item-center margin-auto">
        <p>{`user: ${user?.name}`}</p>
        <TodoList todos={todos} />
      </div>

      <GardenCanvas plants={garden?.plants} />
    </>
  );
};
