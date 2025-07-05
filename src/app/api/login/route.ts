import { NextResponse } from 'next/server';
import { prisma } from '@/libs/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { loginRequestSchema } from '@/app/_types/LoginRequest';
import { signJwt } from '@/app/api/_helper/jwt';

// アカウントロックに関する設定
const MAX_LOGIN_ATTEMPTS = 5; // 5回失敗でロック
const LOCKOUT_PERIOD_MINUTES = 15; // 15分間ロック

/**
 * POST /api/login
 * ユーザーログインを処理するAPIエンドポイント
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = loginRequestSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    // ユーザーが存在しない場合、ユーザー特定のヒントを与えないよう一般的なエラーを返す
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'メールアドレスまたはパスワードが正しくありません。' },
        { status: 401 } // 401 Unauthorized
      );
    }

    // --- アカウントロック処理 ---
    if (user.isLocked && user.lastFailedLoginAt) {
      const lockoutTime = new Date(user.lastFailedLoginAt.getTime() + LOCKOUT_PERIOD_MINUTES * 60000);
      if (new Date() < lockoutTime) {
        return NextResponse.json(
          { success: false, message: `アカウントはロックされています。しばらくしてから再度お試しください。` },
          { status: 403 } // 403 Forbidden
        );
      } else {
        // ロック時間が経過していれば解除
        await prisma.user.update({
          where: { id: user.id },
          data: { isLocked: false, failedLoginAttempts: 0, lastFailedLoginAt: null },
        });
      }
    }

    // --- パスワード照合 ---
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);

    if (isPasswordValid) {
      // 成功：失敗カウントをリセット
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lastFailedLoginAt: null },
      });

      // JWTを生成
      const token = await signJwt({ sub: user.id, email: user.email });
      const response = NextResponse.json({ success: true, message: 'ログインに成功しました。' });

      // CookieにJWTをセット (HttpOnlyでJSからのアクセスを防ぐ)
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24, // 24時間
      });

      return response;
    } else {
      // 失敗：失敗カウントをインクリメント
      const newAttempts = user.failedLoginAttempts + 1;
      let lockAccount = false;
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        lockAccount = true;
      }
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newAttempts,
          isLocked: lockAccount,
          lastFailedLoginAt: new Date(),
        },
      });

      return NextResponse.json(
        { success: false, message: 'メールアドレスまたはパスワードが正しくありません。' },
        { status: 401 }
      );
    }
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: '入力形式が正しくありません。' }, { status: 400 });
    }
    console.error('Login API Error:', e);
    return NextResponse.json({ success: false, message: 'サーバー側でエラーが発生しました。' }, { status: 500 });
  }
}