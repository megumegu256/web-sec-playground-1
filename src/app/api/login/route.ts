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
import bcrypt from "bcryptjs"; // bcryptjs をインポート

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const POST = async (req: NextRequest) => {
  try {
    const requestBody = await req.json();
    const result = loginRequestSchema.safeParse(requestBody);

    if (!result.success) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "リクエストボディの形式が不正です。",
      };
      return NextResponse.json(res, { status: 400 });
    }
    const loginRequest = result.data;

    const user = await prisma.user.findUnique({
      where: { email: loginRequest.email },
    });

    if (!user) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "メールアドレスまたはパスワードの組み合わせが正しくありません。",
      };
      return NextResponse.json(res, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare( // bcryptjs を使用
      loginRequest.password,
      user.password,
    );
    if (!isValidPassword) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "メールアドレスまたはパスワードの組み合わせが正しくありません。",
      };
      return NextResponse.json(res, { status: 401 });
    }

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
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error("Login API Error:", e); // エラーオブジェクト全体をログに出力するとスタックトレースも見れる
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "ログイン処理中にサーバー側でエラーが発生しました。",
    };
    return NextResponse.json(res, { status: 500 });
  }
};