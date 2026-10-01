import z from "zod";

// validation check

const titleSchema = z
  .string()
  .trim()
  .min(1, "タスク名を設定してください。")
  .max(30, "タスク名を30文字以下で設定してください。");

// 分の文字列 -> 秒の数値 に変換
const minutesToSeconds = z
  .string()
  .regex(/^\d+$/, "設定時間には半角数字のみ入力してください。")
  .transform((val) => Number(val) * 60) // 分 -> 秒
  .pipe(
    z
      .number()
      .min(600, "最低設定時間は10分以上です。")
      .max(28800, "最大設定時間は480分(8時間)までです。"),
  );

const emptyTo =
  <T>(fb: T) =>
  (val: unknown) =>
    typeof val === "string" && val.trim() === "" ? fb : val;

export const createTodoSchema = z.object({
  title: titleSchema,
  targetDuration: z.preprocess(emptyTo(undefined), minutesToSeconds.optional()),
});
export const editTodoSchema = z.object({
  title: titleSchema,
  targetDuration: z.preprocess(emptyTo(null), minutesToSeconds.nullable()),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type EditTodoInput = z.infer<typeof editTodoSchema>;
