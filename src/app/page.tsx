'use client';

import Link from 'next/link';
import { useAuth } from './_contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function HomePage() {
  // 認証情報を取得
  const { user, isLoading } = useAuth();

  // 読み込み中の表示
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-gray-500" />
      </div>
    );
  }

  return (
    <div className="text-center p-8 bg-white rounded-lg shadow-md">
      {user ? (
        // --- ログイン済みの場合 ---
        <div>
          <h1 className="text-3xl font-bold mb-4">
            ようこそ、{user.name || user.email}さん！
          </h1>
          <p className="text-gray-600 mb-6">
            すべての機能が利用可能です。
          </p>
          <div className="space-x-4">
            <Link 
              href="/mypage/password" 
              className="px-6 py-2 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
            >
              パスワードを変更する
            </Link>
          </div>
        </div>
      ) : (
        // --- 未ログインの場合 ---
        <div>
          <h1 className="text-3xl font-bold mb-4">
            Web Security Playground へようこそ！
          </h1>
          <p className="text-gray-600 mb-6">
            ログインまたは新規登録をして、すべての機能をお試しください。
          </p>
          <div className="space-x-4">
            <Link 
              href="/login" 
              className="px-6 py-2 font-semibold text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors"
            >
              ログイン
            </Link>
            <Link 
              href="/signup" 
              className="px-6 py-2 font-semibold text-white bg-indigo-500 rounded-md hover:bg-indigo-600 transition-colors"
            >
              新規登録
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}