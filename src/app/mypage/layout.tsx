'use client';

import React from 'react';
import { useAuth } from '@/app/_contexts/AuthContext';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faSpinner } from '@fortawesome/free-solid-svg-icons';

/**
 * マイページ関連のルート (/mypage/*) に適用されるレイアウト
 * 認証状態をチェックし、未ログインの場合はアクセスを制限する
 */
export default function MypageLayout({ children }: { children: React.ReactNode }) {
  // AuthContextからユーザー情報と読み込み状態を取得
  const { user, isLoading } = useAuth();

  // 認証状態を確認中の表示
  if (isLoading) {
    return (
      <main className="p-8 text-center">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-gray-500" />
        <p className="mt-3 text-gray-600">認証情報を確認中...</p>
      </main>
    );
  }

  // 未ログインの場合の表示
  if (!user) {
    return (
      <main className="p-8 text-center">
        <h1 className="text-2xl font-bold">
          <FontAwesomeIcon icon={faTriangleExclamation} className="mr-1.5" />
          ログインが必要です
        </h1>
        <div className="mt-4">
          このコンテンツを利用するためには
          <Link href="/login" className="px-1 text-blue-500 hover:underline">
            ログイン
          </Link>
          してください。
        </div>
      </main>
    );
  }

  // ログイン済みの場合は、ページの中身 (children) を表示
  return <>{children}</>;
}