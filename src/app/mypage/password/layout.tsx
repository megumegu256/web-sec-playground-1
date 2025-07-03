'use client';

import React from 'react';
import { useAuth } from '@/app/_hooks/useAuth';
import Link from 'next/link';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * マイページ関連のルート（/mypage/*）に適用されるレイアウト。
 * 認証状態をチェックし、未ログインの場合はアクセスを制限します。
 */
export default function MypageLayout({ children }: { children: React.ReactNode }) {
  // useAuthフックで認証状態を取得
  const { user, isLoading, error } = useAuth();

  // 認証状態を確認中の表示
  if (isLoading) {
    return (
      <main className="p-4 md:p-8 text-center">
        <p>読み込み中...</p>
      </main>
    );
  }

  // 未ログインまたはエラーの場合の表示
  if (error || !user) {
    return (
      <main className="p-4 md:p-8 text-center">
        <div className="text-2xl font-bold">
          <FontAwesomeIcon icon={faTriangleExclamation} className="mr-1.5" />
          ログインが必要なコンテンツ
        </div>
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

  // ログイン済みの場合は、ページの中身（children）を表示
  return <>{children}</>;
}
