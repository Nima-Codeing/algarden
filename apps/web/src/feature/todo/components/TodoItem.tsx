type Props = {
  title: string;
  targetDuration: number | null;
  onComplete: () => void;
  onStart: () => void;
};

export const TodoItem = ({
  title,
  targetDuration,
  onComplete,
  onStart,
}: Props) => {
  return (
    <div className="flex text-lg text-bold font-sans mx-4 my-2 border-b-1 border-purple-500 grid grid-cols-4 gap-1">
      {/* check box */}
      <div className="m-auto">
        <input type="checkbox" onChange={onComplete} />
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
          <button onClick={onStart}>start</button>
        </span>
      </div>
    </div>
  );
};
