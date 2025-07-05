import { NextResponse } from 'next/server';

/**
 * POST /api/logout
 * ユーザーログアウトを処理するAPIエンドポイント
 */
export async function POST() {
  try {
    // フロントエンドに返すレスポンスを作成
    const response = NextResponse.json({
      success: true,
      message: 'ログアウトしました。',
    });

    // 'auth-token'という名前のCookieを削除するようレスポンスに設定
    // （値を空にし、有効期限を過去に設定することで削除を実現）
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0, // 有効期限を0に設定
    });

    return response;
  } catch (e) {
    console.error('Logout API Error:', e);
    return NextResponse.json(
      { success: false, message: 'サーバー側でエラーが発生しました。' },
      { status: 500 }
    );
  }
}