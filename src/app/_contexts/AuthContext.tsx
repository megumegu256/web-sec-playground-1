'use client';

import React, { createContext, useContext } from 'react';
import useSWR, { mutate } from 'swr';

// ユーザー情報の型定義（後で正式なファイルに移動します）
type UserProfile = {
  id: string;
  email: string;
  name: string | null;
};

// APIからのレスポンスの型定義
type ApiResponse<T> = {
  success: boolean;
  payload: T;
  message?: string;
};

// Contextが提供する値の型
interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: any;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// APIからデータを取得するための関数
const fetcher = (url: string) =>
  fetch(url, { credentials: 'same-origin' }).then((res) => res.json());

// 認証情報を提供するプロバイダーコンポーネント
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, error, isLoading } = useSWR<ApiResponse<UserProfile | null>>(
    '/api/auth', // このAPIは後で作成します
    fetcher,
    {
      revalidateOnFocus: false, // フォーカス時に自動で再検証しない
    }
  );

  const user = data?.success ? data.payload : null;

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
    // ログアウト後、認証状態のキャッシュをクリアしてUIを即時更新
    await mutate('/api/auth', undefined, { revalidate: false });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 他のコンポーネントから認証情報を簡単に利用するためのカスタムフック
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};