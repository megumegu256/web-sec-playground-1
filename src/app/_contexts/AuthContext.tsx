"use client";

import React, { createContext } from "react";
import type { UserProfile } from "@/app/_types/UserProfile";
import useSWR, { mutate } from "swr"; // mutate をインポート
import type { ApiResponse } from "../_types/ApiResponse";
import { jwtFetcher } from "./jwtFetcher";
import { sessionFetcher } from "./sessionFetcher";
import { AUTH } from "@/config/auth";

// Contextが提供する値の型を定義
interface AuthContextProps {
  userProfile: UserProfile | null;
  isLoading: boolean; // 読み込み状態を追加
  logout: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined,
);

interface Props {
  children: React.ReactNode;
}

const AuthProvider: React.FC<Props> = ({ children }) => {
  // useSWRからisLoadingも取得する
  const { data: session, isLoading } = useSWR<ApiResponse<UserProfile | null>>(
    "/api/auth",
    AUTH.isSession ? sessionFetcher : jwtFetcher,
    { revalidateOnFocus: false } // オプション：フォーカス時の自動再検証を無効化
  );

  // ログインしているユーザーの情報を決定（useState/useEffectを廃止し、よりシンプルで安全に）
  const userProfile = session?.success ? session.payload : null;

  const logout = async () => {
    if (AUTH.isSession) {
      await fetch("/api/logout", { method: "DELETE" });
    } else {
      localStorage.removeItem("jwt");
    }
    // SWR キャッシュを無効化 (既存のコードに合わせてグローバルmutateを使用)
    mutate("/api/auth", undefined, { revalidate: false });
    return true;
  };

  // isLoadingも含めてContextに提供
  return (
    <AuthContext.Provider value={{ userProfile, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
