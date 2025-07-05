'use client';

import Link from 'next/link';
import { useAuth } from './_contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Button } from './_components/Button';

export default function HomePage() {
  const { user, isLoading, theme, setTheme } = useAuth();

  const themeButtons = [
    { name: 'ライト', theme: 'light', style: 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100' },
    { name: 'ダーク', theme: 'dark', style: 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700' },
    { name: 'フューチャー', theme: 'future', style: 'bg-slate-900 text-teal-400 border-slate-600 hover:bg-slate-800' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-foreground/50" />
      </div>
    );
  }

  return (
    <div className="text-center p-8 bg-card text-card-foreground rounded-lg shadow-md border border-border">
      {user ? (
        <div>
          <h1 className="text-3xl font-bold mb-4">
            ようこそ、{user.name || user.email}さん！
          </h1>
          <p className="text-muted-foreground mb-6">すべての機能が利用可能です。</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/mypage/password">
              <Button>パスワードを変更する</Button>
            </Link>
            <Link href="/mypage/history">
              <Button variant="secondary">ログイン履歴を見る</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-bold mb-4">
            Playground へようこそ！
          </h1>
          <p className="text-muted-foreground mb-6">
            ログインまたは新規登録をして、すべての機能をお試しください。
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/login" className="w-1/3">
              <Button>ログイン</Button>
            </Link>
            <Link href="/signup" className="w-1/3">
              <Button variant="secondary">新規登録</Button>
            </Link>
          </div>
        </div>
      )}

      <div className="mt-10 pt-6 border-t border-border">
        <h3 className="text-sm font-semibold mb-3">テーマを選択</h3>
        <div className="flex justify-center items-center space-x-3">
          {themeButtons.map((btn) => {
            const isActive = theme === btn.theme;
            return (
              <button
                key={btn.theme}
                onClick={() => setTheme(btn.theme)}
                className={`
                  px-4 py-1 text-sm rounded-md transition-all border
                  ${btn.style}
                  ${isActive ? 'ring-2 ring-offset-2 ring-offset-card ring-primary' : 'font-semibold'}
                `}
              >
                {btn.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}