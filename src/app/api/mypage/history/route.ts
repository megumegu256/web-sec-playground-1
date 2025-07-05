import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/libs/prisma';
import { verifyJwt } from '@/app/api/_helper/jwt';

/**
 * GET /api/mypage/history
 * 認証済みユーザーのログイン履歴を取得する
 */
export async function GET() {
  try {
    // 認証状態を確認
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: '認証されていません。' }, { status: 401 });
    }
    const verifiedToken = await verifyJwt(token);
    if (!verifiedToken?.sub) {
      return NextResponse.json({ success: false, message: '認証トークンが無効です。' }, { status: 401 });
    }
    const userId = verifiedToken.sub;

    // ログイン履歴を新しい順に取得
    const histories = await prisma.loginHistory.findMany({
      where: { userId: userId },
      orderBy: { loginAt: 'desc' },
      take: 20, // 最新20件まで取得
    });

    return NextResponse.json({ success: true, payload: histories });

  } catch (e) {
    console.error('History API Error:', e);
    return NextResponse.json({ success: false, message: 'サーバー側でエラーが発生しました。' }, { status: 500 });
  }
}