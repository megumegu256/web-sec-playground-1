import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/libs/prisma';
import { verifyJwt } from '@/app/api/_helper/jwt';
import { userProfileSchema } from '@/app/_types/UserProfile';

/**
 * GET /api/auth
 * Cookie内のJWTを検証し、現在のログイン状態を返すAPI
 */
export async function GET() {
  try {
    // 1. ブラウザのCookieから認証トークンを取得
    const token = cookies().get('auth-token')?.value;

    // トークンが存在しない場合は、未ログインとしてnullを返す
    if (!token) {
      return NextResponse.json({ success: true, payload: null });
    }

    // 2. トークンを検証
    const verifiedToken = await verifyJwt(token);
    if (!verifiedToken?.sub) {
      // トークンが無効な場合も、未ログインとしてnullを返す
      return NextResponse.json({ success: true, payload: null });
    }

    // 3. トークン内のユーザーIDを使ってデータベースからユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: verifiedToken.sub },
    });

    if (!user) {
      // ユーザーがDBに存在しない場合 (削除されたなど)
      return NextResponse.json({ success: true, payload: null });
    }

    // 4. パスワードなどの機密情報を除外してフロントエンドに返す
    const safeUserData = userProfileSchema.parse(user);

    return NextResponse.json({ success: true, payload: safeUserData });
  } catch (e) {
    console.error('Auth API Error:', e);
    // 500 Internal Server Error: サーバー側で予期せぬ事態が発生
    return NextResponse.json(
      { success: false, message: 'サーバー側でエラーが発生しました。', payload: null },
      { status: 500 }
    );
  }
}