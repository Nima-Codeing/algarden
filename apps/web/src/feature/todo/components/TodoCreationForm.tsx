import { useState } from "react";
import type { useCreateTodo } from "../api/queries";
import { IconButton } from "../../../components/ui/molecules/IconButton";
import { iconMap } from "../../../common/constants/icons";
import { z } from "zod";
import { RangeSlider } from "../../../components/ui/molecules/RangeSlider";
import { Text } from "../../../components/ui/atoms/Text";

const DEFAULT_MINUTES = "60";
const TEN_MINUTES = 10;
const EIGHT_HOURS = 480;

const todoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "タスク名を設定してください。")
    .max(30, "タスク名を30文字以下で設定してください。"),
  targetDuration: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z
      .string()
      .regex(/^\d+$/, "設定時間には半角数字のみ入力してください。")
      .transform((val) => Number(val) * 60) // 分 -> 秒
      .pipe(
        z
          .number()
          .min(600, "最低設定時間は10分以上です。")
          .max(28800, "最大設定時間は480分(8時間)までです。"),
      )
      .optional(),
  ),
});

type TodoCreationFormProps = {
  createMutation: ReturnType<typeof useCreateTodo>;
};

export const TodoCreationForm = ({ createMutation }: TodoCreationFormProps) => {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [targetDuration, setTargetDuration] = useState<string>("");

  const isTime = targetDuration !== "";

  const handleTimeSwitch = () =>
    setTargetDuration(isTime ? "" : DEFAULT_MINUTES);

  const handleCreateSwitch = () => setIsCreating(!isCreating);

  const handleSubmit = (e: React.SubmitEvent) => {
    // ページのリロードを止める
    e.preventDefault();

    // 入力値チェック
    const res = todoSchema.safeParse({ title, targetDuration });
    if (!res.success) {
      const errorMessages = res.error.issues
        .map((err) => err.message)
        .join("\n");

      alert(errorMessages);
      return;
    }

    createMutation.mutate(res.data, {
      onSuccess: () => {
        setTitle("");
        setTargetDuration("");
        setIsCreating(false);
      },
    });
  };

  if (!isCreating) {
    return (
      <div className="flex justify-center">
        <IconButton
          icon={iconMap["plus"]}
          variant="circle"
          onClick={handleCreateSwitch}
        />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-16 place-items-center w-full"
    >
      <div className="flex justify-center col-span-1 w-full">
        <IconButton
          icon={iconMap["minus"]}
          iconClassName="stroke-[3]"
          variant="none"
          onClick={handleCreateSwitch}
        />
      </div>
      <div className="col-span-10 grid grid-cols-10 place-items-center w-full">
        <div className="col-span-2 min-w-0 w-full">
          <Text
            as="label"
            htmlFor="todo-title"
            className="block w-full truncate"
          >
            Todo名<span className="text-red-600">*</span>:
          </Text>
        </div>
        <div className="flex justify-start col-span-8 w-full">
          <input
            id="todo-title"
            className="border-2 border-gray-700 rounded mr-8 w-full"
            value={title}
            type="text"
            placeholder=" task name"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>
      <div className="col-span-5 grid grid-cols-5 place-items-center w-full">
        <div className="flex justify-center col-span-2 w-full">
          <Text className="w-full text-right truncate">{"目標時間:"}</Text>
        </div>
        <div className="flex justify-center col-span-2 w-full">
          <div className="relative inline-block w-11 h-5">
            <input
              checked={isTime}
              id="switch-component"
              type="checkbox"
              className="peer appearance-none w-11 h-5 bg-slate-100 rounded-full checked:bg-slate-800 cursor-pointer transition-colors duration-300"
              onChange={handleTimeSwitch}
            />
            <label
              htmlFor="switch-component"
              className="absolute top-0 left-0 w-5 h-5 bg-white rounded-full border border-slate-300 shadow-sm transition-transform duration-300 peer-checked:translate-x-6 peer-checked:border-slate-800 cursor-pointer"
            ></label>
          </div>
        </div>
        <div className="flex justify-center col-span-1 w-full">
          <IconButton
            icon={iconMap["plus"]}
            type="submit"
            disabled={createMutation.isPending}
            iconClassName="stroke-[5]"
            variant="none"
          />
        </div>
      </div>

      {isTime && (
        <div className="col-span-16 w-full">
          <RangeSlider
            title="目標時間設定"
            min={TEN_MINUTES}
            max={EIGHT_HOURS}
            value={targetDuration}
            onChange={setTargetDuration}
          />
        </div>
      )}
    </form>
  );
};
