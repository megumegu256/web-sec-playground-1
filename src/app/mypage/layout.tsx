'use client';

import React from 'react';
import { useAuth } from '@/app/_contexts/AuthContext';
import Link from 'next/link';
// ▼▼▼ next/navigation から usePathname をインポート ▼▼▼
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function MypageLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  // ▼▼▼ 現在のページのパスを取得 ▼▼▼
  const pathname = usePathname();

  if (isLoading) {
    // (変更なし)
    return (
      <main className="p-8 text-center">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-gray-500" />
        <p className="mt-3 text-gray-600">認証情報を確認中...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="p-8 text-center">
        <h1 className="text-2xl font-bold">
          <FontAwesomeIcon icon={faTriangleExclamation} className="mr-1.5" />
          ログインが必要です
        </h1>
        <div className="mt-4">
          このコンテンツを利用するためには
          {/* ▼▼▼ hrefを修正し、リダイレクト先のURLを追加 ▼▼▼ */}
          <Link
            href={`/login?redirect=${pathname}`}
            className="px-1 text-blue-500 hover:underline"
          >
            ログイン
          </Link>
          してください。
        </div>
      </main>
    );
  }

  return <>{children}</>;
}