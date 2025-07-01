// src/app/_actions/login.ts

'use server';

import { prisma } from '@/libs/prisma';
import bcrypt from 'bcrypt';
import type { ServerActionResponse } from '@/app/_types/ServerActionResponse';
import type { LoginRequest } from '@/app/_types/LoginRequest'; // 仮の型定義
import type { UserProfile } from '@/app/_types/UserProfile';
import { userProfileSchema } from '@/app/_types/UserProfile';
import { headers } from 'next/headers'; // ログイン履歴記録用

// 定数の定義
const MAX_LOGIN_ATTEMPTS = 5; // ロックされるまでの失敗回数
const LOCK_TIME_MINUTES = 15; // アカウントロックの時間（分）

export const loginServerAction = async (
  loginRequest: LoginRequest
): Promise<ServerActionResponse<UserProfile | null>> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: loginRequest.email },
    });

    // ユーザーが存在しない場合
    if (!user) {
      return {
        success: false,
        message: 'メールアドレスまたはパスワードが正しくありません。',
        payload: null,
      };
    }

    // --- ▼ アカウントロック機能のロジック ▼ ---

    // アカウントがロックされているか確認
    if (user.isLocked) {
      const lockedAt = user.lockedAt;
      if (lockedAt) {
        const now = new Date();
        const timeDiff = now.getTime() - lockedAt.getTime();
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));

        // ロック時間が経過しているか確認
        if (minutesDiff >= LOCK_TIME_MINUTES) {
          // ロックを解除
          await prisma.user.update({
            where: { id: user.id },
            data: {
              isLocked: false,
              lockedAt: null,
              failedLoginAttempts: 0,
            },
          });
        } else {
          // まだロック時間中の場合
          return {
            success: false,
            message: `アカウントはロックされています。${LOCK_TIME_MINUTES - minutesDiff}分後にもう一度お試しください。`,
            payload: null,
          };
        }
      }
    }
    
    // パスワードの検証
    const isPasswordValid = await bcrypt.compare(loginRequest.password, user.password);

    if (!isPasswordValid) {
      const newAttempts = user.failedLoginAttempts + 1;
      
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        // アカウントをロック
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: newAttempts,
            isLocked: true,
            lockedAt: new Date(),
          },
        });
        return {
          success: false,
          message: 'アカウントがロックされました。しばらくしてから再度お試しください。',
          payload: null,
        };
      } else {
        // 失敗回数を更新
        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: newAttempts },
        });
      }
      
      return {
        success: false,
        message: 'メールアドレスまたはパスワードが正しくありません。',
        payload: null,
      };
    }
    
    // ログイン成功: 失敗回数をリセット
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        isLocked: false,
        lockedAt: null
      },
    });

    // --- ▲ アカウントロック機能のロジック ▲ ---

    // 【ここにログイン履歴を記録する処理を追加します（後述）】

    const headersList = headers();
    const ipAddress = headersList.get('x-forwarded-for') ?? 'Unknown';
    const userAgent = headersList.get('user-agent') ?? 'Unknown';

    await prisma.loginHistory.create({
        data: {
            userId: user.id,
            ipAddress: ipAddress,
            userAgent: userAgent,
        },
});

    const response: ServerActionResponse<UserProfile> = {
      success: true,
      payload: userProfileSchema.parse(user),
      message: 'ログインしました。',
    };
    return response;

  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'Internal Server Error';
    console.error(errorMsg);
    return {
      success: false,
      payload: null,
      message: 'サーバーサイドでエラーが発生しました。',
    };
  }
};