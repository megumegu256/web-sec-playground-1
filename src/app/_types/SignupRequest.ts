import { z } from 'zod';
import { passwordSchema } from './CommonSchemas';

/**
 * Validation schema for the signup request.
 */
export const signupRequestSchema = z.object({
  email: z.string().email({ message: '無効なメールアドレスです。' }),
  password: passwordSchema, // 共通のパスワード強度スキーマを利用
  name: z.string().min(1, { message: 'お名前を入力してください。' }),
});

/**
 * TypeScript type for the signup request, inferred from the Zod schema.
 */
export type SignupRequest = z.infer<typeof signupRequestSchema>;