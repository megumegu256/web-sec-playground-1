'use client';

import React from 'react';
import { useAuth } from '@/app/_hooks/useAuth';
import Link from 'next/link';
import { faSpinner, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function MypageLayout({ children }: { children: React.ReactNode }) {
  // useAuthフックからisLoadingも受け取る
  const { userProfile, isLoading } = useAuth();

  // 認証状態を確認中の表示
  if (isLoading) {
    return (
      <main className="p-8 text-center">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-gray-500" />
        <p className="mt-3 text-gray-600">認証情報を確認中...</p>
      </main>
    );
  }

  // 確認が終わった後、未ログインの場合の表示
  if (!userProfile) {
    return (
      <main className="p-8 text-center">
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

  // ログイン済みの場合は、ページの中身を表示
  return <>{children}</>;
}
