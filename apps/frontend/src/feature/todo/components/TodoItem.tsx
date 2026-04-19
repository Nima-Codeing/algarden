type Props = {
  title: string;
  targetDuration?: number;
};

export const TodoItem = ({ title, targetDuration }: Props) => {
  return (
    <div className="flex text-lg text-bold font-sans mx-4 my-2 border-b-1 border-purple-500 grid grid-cols-4 gap-1">
      {/* check box */}
      <div className="m-auto">
        <input type="checkbox" />
      </div>

      {/* title */}
      <div className="m-auto">
        <span>{title}</span>
      </div>

      {/* targetDuration */}
      <div className="m-auto">
        <span>{targetDuration ? targetDuration / 60 : '-'}</span>
      </div>

      <div className="m-auto">
        <span className="ml-1">m</span>
      </div>
    </div>
  );
};
