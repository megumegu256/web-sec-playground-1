import { z } from 'zod';
// 既存のサインアップ等で利用している共通のパスワードスキーマをインポートします
import { passwordSchema } from './CommonSchemas';

/**
 * パスワード変更リクエストのバリデーションスキーマ
 */
export const changePasswordRequestSchema = z
  .object({
    // 現在のパスワード：必須入力
    currentPassword: z.string().min(1, { message: '現在のパスワードを入力してください。' }),
    
    // 新しいパスワード：共通のパスワード強度スキーマを適用
    newPassword: passwordSchema,
    
    // 確認用パスワード：共通のパスワード強度スキーマを適用
    confirmPassword: passwordSchema,
  })
  // 新しいパスワードと確認用パスワードが一致するかを検証
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '新しいパスワードが一致しません。',
    path: ['confirmPassword'], // エラーメッセージを関連付けるフィールド
  });

/**
 * パスワード変更リクエストの型定義
 * Zodスキーマから自動的に型を生成します
 */
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;
