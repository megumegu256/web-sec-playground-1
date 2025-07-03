'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/libs/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';

// 先ほど作成した入力値検証スキーマと型をインポート
import {
  changePasswordRequestSchema,
  type ChangePasswordRequest,
} from '@/app/_types/ChangePasswordRequest';

// サーバーからの応答の型定義
import type { ServerActionResponse } from '@/app/_types/ServerActionResponse';

// 認証トークンを検証するヘルパー関数をインポート
// プロジェクトの認証方式に合わせてパスを修正してください
import { verifyJwt } from '@/app/api/_helper/verifyJwt'; 

/**
 * パスワードを変更するためのServer Action
 * @param request パスワード変更フォームからの入力データ
 * @returns 処理結果を示すServerActionResponse
 */
export const changePasswordAction = async (
  request: ChangePasswordRequest,
): Promise<ServerActionResponse<null>> => {
  try {
    // --- 1. 認証状態の確認 ---
    // Cookieから認証トークンを取得
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return { success: false, message: '認証トークンがありません。ログインしてください。', payload: null };
    }

    // トークンを検証して、ユーザー情報を取得
    const verifiedToken = await verifyJwt(token);
    if (!verifiedToken?.payload?.sub) {
      return { success: false, message: '認証が無効です。再度ログインしてください。', payload: null };
    }
    const userId = verifiedToken.payload.sub;

    // --- 2. 入力値のサーバーサイド検証 ---
    const validatedData = changePasswordRequestSchema.parse(request);

    // --- 3. データベースからユーザー情報を取得 ---
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
      // このエラーは通常発生しないはずだが、念のためチェック
      return { success: false, message: 'ユーザー情報が見つかりません。', payload: null };
    }

    // --- 4. 現在のパスワードが正しいか照合 ---
    const isCurrentPasswordValid = await bcrypt.compare(
      validatedData.currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      return { success: false, message: '現在のパスワードが間違っています。', payload: null };
    }
    
    // 現在のパスワードと新しいパスワードが同じ場合はエラー
    if (validatedData.currentPassword === validatedData.newPassword) {
      return { success: false, message: '新しいパスワードが現在のパスワードと同じです。', payload: null };
    }

    // --- 5. 新しいパスワードをハッシュ化 ---
    const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, 10);

    // --- 6. データベースのパスワードを更新 ---
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    // --- 7. 成功レスポンスを返す ---
    return { success: true, message: 'パスワードが正常に変更されました。', payload: null };

  } catch (e) {
    // Zodのバリデーションエラーをハンドリング
    if (e instanceof z.ZodError) {
      // 詳細なエラー内容はクライアントに返さず、汎用的なメッセージを返す
      return { success: false, message: '入力内容に誤りがあります。', payload: null };
    }

    // その他の予期せぬエラー
    console.error('Change Password Action Error:', e);
    return {
      success: false,
      // 詳細なエラーメッセージはクライアントに返さない
      message: 'サーバー側で予期せぬエラーが発生しました。',
      payload: null,
    };
  }
};
