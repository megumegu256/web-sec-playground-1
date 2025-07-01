// src/app/api/login/route.ts
import { prisma } from "@/libs/prisma";
import { loginRequestSchema } from "@/app/_types/LoginRequest";
import { userProfileSchema } from "@/app/_types/UserProfile";
import type { UserProfile } from "@/app/_types/UserProfile";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import { NextResponse, NextRequest } from "next/server";
import { createSession } from "@/app/api/_helper/createSession";
import { createJwt } from "@/app/api/_helper/createJwt";
import { AUTH } from "@/config/auth";
import bcrypt from "bcrypt";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

// --- 定数を定義 ---
const MAX_LOGIN_ATTEMPTS = 5; // 5回失敗でロック
const LOCK_TIME_MINUTES = 15; // ロック時間は15分

export const POST = async (req: NextRequest) => {
  try {
    const requestBody = await req.json();
    const result = loginRequestSchema.safeParse(requestBody);

    if (!result.success) {
      return NextResponse.json({ message: "リクエスト形式が不正です。" }, { status: 400 });
    }
    const loginRequest = result.data;

    const user = await prisma.user.findUnique({
      where: { email: loginRequest.email },
    });

    if (!user) {
      return NextResponse.json({ message: "メールアドレスまたはパスワードが正しくありません。" }, { status: 401 });
    }

    // --- アカウントロック機能のロジック ---

    // 1. アカウントがロックされているか確認
    if (user.isLocked && user.lockedAt) {
      const now = new Date();
      const timeDiff = now.getTime() - user.lockedAt.getTime();
      const minutesDiff = Math.floor(timeDiff / (1000 * 60));

      // 2. ロック時間が経過していれば解除
      if (minutesDiff >= LOCK_TIME_MINUTES) {
        await prisma.user.update({
          where: { id: user.id },
          data: { isLocked: false, lockedAt: null, failedLoginAttempts: 0 },
        });
      } else {
        // 3. まだロック中の場合はエラーを返す
        const remainingTime = LOCK_TIME_MINUTES - minutesDiff;
        return NextResponse.json({ message: `アカウントはロックされています。約${remainingTime}分後にもう一度お試しください。` }, { status: 403 }); // 403 Forbidden
      }
    }

    const isValidPassword = await bcrypt.compare(
      loginRequest.password,
      user.password,
    );

    if (!isValidPassword) {
      // 4. パスワードが不正な場合、失敗回数をインクリメント
      const newAttempts = user.failedLoginAttempts + 1;
      let updateData: { failedLoginAttempts: number; isLocked?: boolean; lockedAt?: Date | null } = {
        failedLoginAttempts: newAttempts,
      };

      // 5. 失敗回数が上限に達したらロックする
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        updateData.isLocked = true;
        updateData.lockedAt = new Date();
      }
      await prisma.user.update({ where: { id: user.id }, data: updateData });

      return NextResponse.json({ message: "メールアドレスまたはパスワードが正しくありません。" }, { status: 401 });
    }

    // 6. ログイン成功時、失敗回数をリセット
    if (user.failedLoginAttempts > 0 || user.isLocked) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, isLocked: false, lockedAt: null },
      });
    }
    
    // --- ログイン履歴の記録 ---
    const ipAddress = req.headers.get('x-forwarded-for') ?? req.ip ?? 'Unknown';
    const userAgent = req.headers.get('user-agent') ?? 'Unknown';

    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress: ipAddress,
        userAgent: userAgent,
      },
    });

    // 認証成功
    const tokenMaxAgeSeconds = 60 * 60 * 3; // 3時間
    let responsePayload: ApiResponse<UserProfile | string>;

    if (AUTH.isSession) {
      await createSession(user.id, tokenMaxAgeSeconds);
      responsePayload = {
        success: true,
        payload: userProfileSchema.parse(user),
        message: "ログインに成功しました。",
      };
    } else { // AUTH.isJWT
      const jwt = await createJwt(user, tokenMaxAgeSeconds);
      responsePayload = {
        success: true,
        payload: jwt,
        message: "ログインに成功しました。",
      };
    }
    return NextResponse.json(responsePayload);

  } catch (e) {
    console.error("Login API Error:", e);
    return NextResponse.json({ message: "サーバーエラーが発生しました。" }, { status: 500 });
  }
};
