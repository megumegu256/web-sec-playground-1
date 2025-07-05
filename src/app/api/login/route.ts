import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/libs/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { loginRequestSchema } from '@/app/_types/LoginRequest';
import { signJwt } from '@/app/api/_helper/jwt';

// アカウントロックに関する設定
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_PERIOD_MINUTES = 15;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginRequestSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'メールアドレスまたはパスワードが正しくありません。' },
        { status: 401 }
      );
    }

    if (user.isLocked && user.lastFailedLoginAt) {
      const lockoutTime = new Date(user.lastFailedLoginAt.getTime() + LOCKOUT_PERIOD_MINUTES * 60000);
      if (new Date() < lockoutTime) {
        return NextResponse.json(
          { success: false, message: `アカウントはロックされています。しばらくしてから再度お試しください。` },
          { status: 403 }
        );
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { isLocked: false, failedLoginAttempts: 0, lastFailedLoginAt: null },
        });
      }
    }

    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);

    if (isPasswordValid) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lastFailedLoginAt: null },
      });

      // ▼▼▼ コメントを解除して元に戻す ▼▼▼
      const ipAddress = request.headers.get('x-forwarded-for') || request.ip;
      const userAgent = request.headers.get('user-agent');
      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          ipAddress: ipAddress,
          userAgent: userAgent,
        },
      });

      const token = await signJwt({ sub: user.id, email: user.email });
      const response = NextResponse.json({ success: true, message: 'ログインに成功しました。' });
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24,
      });
      return response;

    } else {
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