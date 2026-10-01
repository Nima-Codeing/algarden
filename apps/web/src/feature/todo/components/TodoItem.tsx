import { Text } from "../../../components/ui/atoms/Text";
import { IconButton } from "../../../components/ui/molecules/IconButton";
import { iconMap } from "../../../common/constants/icons.constant";

type Props = {
  title: string;
  targetDurationMinutes: number | null;
  isCompleted: boolean;
  onComplete: () => void;
  onStart: () => void;
  onEditMode: () => void;
};

export const TodoItem = ({
  title,
  targetDurationMinutes,
  isCompleted,
  onComplete,
  onStart,
  onEditMode,
}: Props) => {
  return (
    <div className="grid grid-cols-16 place-items-center w-full">
      <div className="flex justify-center col-span-1 w-full">
        <input
          type="checkbox"
          className="w-4 h-4"
          checked={isCompleted}
          disabled={isCompleted}
          onChange={onComplete}
        />
      </div>
      <div className="flex justify-center col-span-8 w-full">
        <Text className="w-full truncate">{title}</Text>
      </div>
      <div className="col-span-4 grid grid-cols-4 place-items-center w-full">
        <div className="flex justify-center col-span-3 w-full">
          <Text className="w-full mr-4 text-right">
            {targetDurationMinutes || "-"}
          </Text>
        </div>
        <div className="flex justify-center col-span-1 w-full">
          <Text className="w-full ml-4 text-left">m</Text>
        </div>
      </div>
      <div className="col-span-3 grid grid-cols-3 place-items-center w-full">
        <div className="flex justify-center col-span-1 w-full">
          <IconButton
            icon={iconMap[isCompleted ? "playOff" : "play"]}
            variant="none"
            onClick={onStart}
            disabled={isCompleted}
          />
        </div>
        <div className="flex justify-center col-span-1 w-full">
          <IconButton
            icon={iconMap[isCompleted ? "editOff" : "edit"]}
            variant="none"
            onClick={onEditMode}
            disabled={isCompleted}
          />
        </div>
        <div className="flex justify-center col-span-1 w-full">
          {/* Delete */}
        </div>
      </div>
    </div>
  );
};
