import { z } from 'zod';

/**
 * Validation schema for the login request.
 */
export const loginRequestSchema = z.object({
  email: z.string().email({ message: '無効なメールアドレスです。' }),
  password: z.string().min(1, { message: 'パスワードを入力してください。' }),
});

/**
 * TypeScript type for the login request, inferred from the Zod schema.
 */
export type LoginRequest = z.infer<typeof loginRequestSchema>;