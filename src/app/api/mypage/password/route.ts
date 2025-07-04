import { NextResponse } from 'next/server';
import { prisma } from '@/libs/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { changePasswordRequestSchema } from '@/app/_types/ChangePasswordRequest';
import { verifyJwt } from '@/app/api/_helper/verifyJwt';

// next/headersからcookiesをインポートするのをやめます。

/**
 * Cookie文字列から特定の名前の値を解析するヘルパー関数
 * @param cookieHeader 'key1=value1; key2=value2' のような文字列
 * @param name 探したいCookieの名前
 * @returns Cookieの値、または見つからなければundefined
 */
function getCookieValue(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return undefined;
}

/**
 * パスワード変更リクエストを処理するPOSTハンドラ
 */
export async function POST(request: Request) {
  try {
    // --- 1. 認証状態の確認 (標準的なヘッダー解析方式) ---
    const cookieHeader = request.headers.get('Cookie');
    const token = getCookieValue(cookieHeader, 'auth-token');

    if (!token) {
      return NextResponse.json({ success: false, message: '認証トークンがありません。' }, { status: 401 });
    }

    const verifiedToken = await verifyJwt(token);
    if (!verifiedToken?.payload?.sub) {
      return NextResponse.json({ success: false, message: '認証が無効です。' }, { status: 401 });
    }
    const userId = verifiedToken.payload.sub;

    // --- 2. リクエストボディをJSONとして解析し、検証 ---
    const body = await request.json();
    const validatedData = changePasswordRequestSchema.parse(body);

    // --- 3. データベースからユーザー情報を取得 ---
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
      return NextResponse.json({ success: false, message: 'ユーザー情報が見つかりません。' }, { status: 404 });
    }

    // --- 4. 現在のパスワードが正しいか照合 ---
    const isCurrentPasswordValid = await bcrypt.compare(
      validatedData.currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ success: false, message: '現在のパスワードが間違っています。' }, { status: 400 });
    }

    if (validatedData.currentPassword === validatedData.newPassword) {
      return NextResponse.json({ success: false, message: '新しいパスワードが現在のパスワードと同じです。' }, { status: 400 });
    }

    // --- 5. 新しいパスワードをハッシュ化 ---
    const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, 10);

    // --- 6. データベースのパスワードを更新 ---
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    // --- 7. 成功レスポンスを返す ---
    return NextResponse.json({ success: true, message: 'パスワードが正常に変更されました。' });

  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: '入力内容に誤りがあります。' }, { status: 400 });
    }
    console.error('Change Password API Error:', e);
    return NextResponse.json({ success: false, message: 'サーバー側で予期せぬエラーが発生しました。' }, { status: 500 });
  }
}
