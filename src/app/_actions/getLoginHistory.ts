// src/app/_actions/getLoginHistory.ts

'use server';

import { prisma } from '@/libs/prisma';
import { getServerSession } from '@/libs/session'; // ※セッション管理ライブラリに応じて変更
import type { ServerActionResponse } from '@/app/_types/ServerActionResponse';
import type { LoginHistory } from '@prisma/client';

export const getLoginHistoryAction = async (): Promise<
  ServerActionResponse<LoginHistory[] | null>
> => {
  try {
    // 現在のセッションからユーザー情報を取得
    const session = await getServerSession(); 
    if (!session?.user?.id) {
      return { success: false, message: '認証されていません。', payload: null };
    }

    const histories = await prisma.loginHistory.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        loginAt: 'desc', // 新しい順に並べる
      },
      take: 20, // 最新20件のみ取得
    });

    return { success: true, message: '成功', payload: histories };
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'Internal Server Error';
    console.error(errorMsg);
    return { success: false, message: 'サーバーエラー', payload: null };
  }
};