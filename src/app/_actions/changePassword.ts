'use server';

// このファイルからは 'export const dynamic' や 'noStore' を削除します

import { cookies } from 'next/headers';
import { prisma } from '@/libs/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import {
  changePasswordRequestSchema,
  type ChangePasswordRequest,
} from '@/app/_types/ChangePasswordRequest';
import type { ServerActionResponse } from '@/app/_types/ServerActionResponse';
import { verifyJwt } from '@/app/api/_helper/verifyJwt';

/**
 * パスワードを変更するためのServer Action
 */
export const changePasswordAction = async (
  request: ChangePasswordRequest,
): Promise<ServerActionResponse<null>> => {
  try {
    // --- 1. 認証状態の確認 ---
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return { success: false, message: '認証トークンがありません。ログインしてください。', payload: null };
    }

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
    if (e instanceof z.ZodError) {
      return { success: false, message: '入力内容に誤りがあります。', payload: null };
    }

    console.error('Change Password Action Error:', e);
    return {
      success: false,
      message: 'サーバー側で予期せぬエラーが発生しました。',
      payload: null,
    };
  }
};
