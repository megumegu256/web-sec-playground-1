import { NextResponse } from 'next/server';
import { prisma } from '@/libs/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { signupRequestSchema } from '@/app/_types/SignupRequest';

/**
 * POST /api/signup
 * 新規ユーザー登録を処理するAPIエンドポイント
 */
export async function POST(request: Request) {
  try {
    // 1. リクエストボディをJSONとして解析
    const body = await request.json();

    // 2. Zodスキーマで入力データを検証
    const validatedData = signupRequestSchema.parse(body);

    // 3. メールアドレスが既に存在するかデータベースで確認
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      // 409 Conflict: 要求は現在のサーバーの状態と競合している
      return NextResponse.json(
        { success: false, message: 'このメールアドレスは既に使用されています。' },
        { status: 409 }
      );
    }

    // 4. パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // 5. 新しいユーザーをデータベースに作成
    await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        password: hashedPassword,
      },
    });

    // 201 Created: 要求は成功し、その結果新たなリソースが作成された
    return NextResponse.json(
      { success: true, message: 'ユーザー登録が完了しました。' },
      { status: 201 }
    );
  } catch (e) {
    // Zodのバリデーションエラーをハンドリング
    if (e instanceof z.ZodError) {
      // 400 Bad Request: 不正なリクエスト
      return NextResponse.json(
        { success: false, message: e.errors[0]?.message || '入力内容に誤りがあります。' },
        { status: 400 }
      );
    }

    // その他の予期せぬエラー
    console.error('Signup API Error:', e);
    // 500 Internal Server Error: サーバー側で予期せぬ事態が発生
    return NextResponse.json(
      { success: false, message: 'サーバー側でエラーが発生しました。' },
      { status: 500 }
    );
  }
}