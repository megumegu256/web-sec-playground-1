import { z } from 'zod';
import { passwordSchema } from './CommonSchemas';

/**
 * Validation schema for the signup request.
 */
export const signupRequestSchema = z
  .object({
    email: z.string().email({ message: '無効なメールアドレスです。' }),
    name: z.string().min(1, { message: 'お名前を入力してください。' }),
    password: passwordSchema,
    confirmPassword: passwordSchema, // 確認用パスワードのフィールドを追加
  })
  // passwordとconfirmPasswordが一致するかを検証するルールを追加
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません。",
    path: ["confirmPassword"], // エラーメッセージを関連付けるフィールド
  });

/**
 * TypeScript type for the signup request, inferred from the Zod schema.
 */
export type SignupRequest = z.infer<typeof signupRequestSchema>;