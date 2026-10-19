import z from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(4, { message: "ユーザーネームは4〜12文字にしてください。" })
  .max(12, { message: "ユーザーネームは4〜12文字にしてください。" });
const signUpEmailSchema = z
  .string()
  .trim()
  .pipe(
    z.email({
      message: "有効なメールアドレスの形式で入力してください",
    }),
  );
const signUpPasswordSchema = z
  .string()
  .trim()
  .min(8, { message: "パスワードは8文字以上で入力してください" })
  .regex(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).*$/, {
    message:
      "パスワードには英小文字、英大文字、数字、記号を各1文字以上含めてください",
  });

const signInEmailSchema = z
  .string()
  .trim()
  .min(1, { message: "メールアドレスを入力してください。" })
  .pipe(
    z.email({
      message: "メールアドレスの形式で入力してください。",
    }),
  );
const signInPasswordSchema = z
  .string()
  .trim()
  .min(1, { message: "パスワードを入力してください。" });

export const signUpUserSchema = z.object({
  name: nameSchema,
  email: signUpEmailSchema,
  password: signUpPasswordSchema,
});
export const signInUserSchema = z.object({
  email: signInEmailSchema,
  password: signInPasswordSchema,
});
