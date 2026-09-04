import { completeTodo } from "../api/completeTodo";
import { startTodo } from "../api/startTodo";

type Props = {
  id: string;
  title: string;
  targetDuration?: number | null;
};

const handleChange = async (
  id: string,
  e: React.ChangeEvent<HTMLInputElement>,
) => {
  if (e.target.checked) {
    try {
      await completeTodo(id);
    } catch (e) {
      console.error("Failed to todo complete: " + e);
    }
  }
};

const handleClick = async (id: string) => {
  try {
    await startTodo(id);
  } catch (e) {
    console.error("Failed to todo start: " + e);
  }
};

export const TodoItem = ({ id, title, targetDuration }: Props) => {
  return (
    <div className="flex text-lg text-bold font-sans mx-4 my-2 border-b-1 border-purple-500 grid grid-cols-4 gap-1">
      {/* check box */}
      <div className="m-auto">
        <input type="checkbox" onChange={(e) => handleChange(id, e)} />
      </div>

      {/* title */}
      <div className="m-auto">
        <span>{title}</span>
      </div>

      {/* targetDuration */}
      <div className="m-auto">
        <span>{targetDuration ? targetDuration / 60 : "-"}</span>
      </div>

      <div className="m-auto">
        <span className="ml-1">m</span>
      </div>

      {/* start button */}
      <div className="m-auto">
        <span>
          <button onClick={() => handleClick(id)}>start</button>
        </span>
      </div>
    </div>
  );
};
