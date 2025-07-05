import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/libs/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { changePasswordRequestSchema } from '@/app/_types/ChangePasswordRequest';
import { verifyJwt } from '@/app/api/_helper/jwt';

/**
 * POST /api/mypage/password
 * 認証済みユーザーのパスワード変更を処理する
 */
export async function POST(request: Request) {
  try {
    // 1. CookieからJWTを取得し、認証状態を確認
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: '認証されていません。' }, { status: 401 });
    }
    const verifiedToken = await verifyJwt(token);
    if (!verifiedToken?.sub) {
      return NextResponse.json({ success: false, message: '認証トークンが無効です。' }, { status: 401 });
    }
    const userId = verifiedToken.sub;

    // 2. リクエストボディを検証
    const body = await request.json();
    const validatedData = changePasswordRequestSchema.parse(body);

    // 3. データベースからユーザーを取得
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ success: false, message: 'ユーザーが見つかりません。' }, { status: 404 });
    }

    // 4. 現在のパスワードが正しいか照合
    const isCurrentPasswordValid = await bcrypt.compare(validatedData.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ success: false, message: '現在のパスワードが間違っています。' }, { status: 400 });
    }

    // 5. 新しいパスワードをハッシュ化
    const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, 10);

    // 6. データベースのパスワードを更新
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({ success: true, message: 'パスワードが正常に変更されました。' });

  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: e.errors[0]?.message }, { status: 400 });
    }
    console.error('Password Change API Error:', e);
    return NextResponse.json({ success: false, message: 'サーバー側でエラーが発生しました。' }, { status: 500 });
  }
}