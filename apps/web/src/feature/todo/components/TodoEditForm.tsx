import { useState } from "react";

import { Text } from "../../../components/ui/atoms/Text";
import { IconButton } from "../../../components/ui/molecules/IconButton";
import { iconMap } from "../../../common/constants/icons.constant";
import { editTodoSchema } from "../todoSchema";
import type {
  useUpdateTodoTargetDuration,
  useUpdateTodoTitle,
} from "../api/queries";

type TodoEditFormProps = {
  id: string;
  title: string;
  targetDurationMinutes: number | null;
  isStarted: boolean;
  titleMutation: ReturnType<typeof useUpdateTodoTitle>;
  durationMutation: ReturnType<typeof useUpdateTodoTargetDuration>;
  handleExitEditMode: () => void;
};

export const TodoEditForm = ({
  id,
  title: initTitle,
  targetDurationMinutes: initMinutes,
  isStarted,
  titleMutation,
  durationMutation,
  handleExitEditMode,
}: TodoEditFormProps) => {
  const isPending = titleMutation.isPending || durationMutation.isPending;

  const [title, setTitle] = useState<string>(initTitle);
  const [targetDuration, setTargetDuration] = useState<string>(
    initMinutes ? initMinutes.toString() : "",
  );

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    const res = editTodoSchema.safeParse({ title, targetDuration });
    if (!res.success) {
      const errorMessages = res.error.issues
        .map((err) => err.message)
        .join("\n");
      alert(errorMessages);
      return;
    }

    const initSeconds = initMinutes === null ? null : initMinutes * 60;
    const isTitleChanged = res.data.title !== initTitle;
    const isDurationChanged = res.data.targetDuration !== initSeconds;

    if (!isTitleChanged && !isDurationChanged) {
      handleExitEditMode();
      return;
    }

    try {
      if (isTitleChanged) {
        await titleMutation.mutateAsync({ id, title: res.data.title });
      }
      if (isDurationChanged) {
        await durationMutation.mutateAsync({
          id,
          targetDuration: res.data.targetDuration,
        });
      }
      handleExitEditMode();
    } catch {
      // mutation onError がエラー文を出力
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-16 place-items-center w-full"
    >
      <div className="flex justify-center col-span-1 w-full">
        <input type="checkbox" className="w-4 h-4" checked={false} disabled />
      </div>
      <div className="flex justify-center col-span-8 w-full">
        <input
          className="border-2 border-gray-700 rounded mr-8 w-full truncate"
          value={title}
          type="text"
          placeholder=" task name"
          disabled={isPending}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="col-span-4 grid grid-cols-4 place-items-center w-full">
        <div className="flex justify-center col-span-3 w-full">
          {isStarted ? (
            <Text className="w-full mr-4 text-right truncate">
              {targetDuration || "-"}
            </Text>
          ) : (
            <input
              className="w-full mr-4 text-right truncate border-2 border-gray-700 rounded"
              value={targetDuration}
              type="text"
              placeholder="timer"
              disabled={isPending}
              onChange={(e) => setTargetDuration(e.target.value)}
            />
          )}
        </div>
        <div className="flex justify-center col-span-1 w-full">
          <Text className="w-full ml-4 text-left">m</Text>
        </div>
      </div>
      <div className="col-span-3 grid grid-cols-3 place-items-center w-full">
        <div className="flex justify-center col-span-1 w-full"></div>
        <div className="flex justify-center col-span-1 w-full">
          <IconButton
            icon={iconMap["check"]}
            type="submit"
            variant="none"
            disabled={isPending}
          />
        </div>
        <div className="flex justify-center col-span-1 w-full">
          <IconButton
            icon={iconMap["cancel"]}
            variant="none"
            disabled={isPending}
            onClick={handleExitEditMode}
          />
        </div>
      </div>
    </form>
  );
};
