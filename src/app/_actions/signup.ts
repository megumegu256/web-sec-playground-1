// src/app/_actions/signup.ts
"use server";

import { prisma } from "@/libs/prisma";
import { signupRequestSchema } from "@/app/_types/SignupRequest";
import { userProfileSchema } from "@/app/_types/UserProfile";
import type { SignupRequest } from "@/app/_types/SignupRequest";
import type { UserProfile } from "@/app/_types/UserProfile";
import type { ServerActionResponse } from "@/app/_types/ServerActionResponse";
import bcrypt from "bcryptjs"; // bcryptjs をインポート

// ユーザのサインアップのサーバアクション
export const signupServerAction = async (
  signupRequest: SignupRequest,
): Promise<ServerActionResponse<UserProfile | null>> => {
  try {
    const payload = signupRequestSchema.parse(signupRequest);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (existingUser) {
      return {
        success: false,
        payload: null,
        message: "このメールアドレスは既に使用されているか、入力内容に誤りがあります。",
      };
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(payload.password, saltRounds); // bcryptjs を使用

    const user = await prisma.user.create({
      data: {
        email: payload.email,
        password: hashedPassword,
        name: payload.name,
        // role: Role.USER, // 必要に応じて追加 (Prismaスキーマのデフォルト値に依存)
      },
    });

    const res: ServerActionResponse<UserProfile> = {
      success: true,
      payload: userProfileSchema.parse(user),
      message: "ユーザー登録が成功しました。",
    };
    return res;
  } catch (e) {
    let errorMsg = "サインアップ処理中にエラーが発生しました。";
    if (e instanceof Error) {
      console.error("Signup Server Action Error:", e.message);
    } else {
      console.error("Unknown error during signup:", e);
    }
    return {
      success: false,
      payload: null,
      message: errorMsg,
    };
  }
};