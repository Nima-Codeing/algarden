import z from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(4, { message: "ユーザーネームは4〜12文字にしてください。" })
  .max(12, { message: "ユーザーネームは4〜12文字にしてください。" });

const emailSchema = z
  .string()
  .trim()
  .pipe(
    z.email({
      message: "有効なメールアドレスの形式で入力してください",
    }),
  );

const passwordSchema = z
  .string()
  .trim()
  .min(8, { message: "パスワードは8文字以上で入力してください" })
  .regex(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).*$/, {
    message:
      "パスワードには英小文字、英大文字、数字、記号を各1文字以上含めてください",
  });

export const signInUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});
