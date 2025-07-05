'use client';

import { useEffect, useState } from 'react';
import type { LoginHistory } from '@prisma/client';

type ApiResponse<T> = {
  success: boolean;
  payload?: T;
  message?: string;
};

export default function LoginHistoryPage() {
  const [histories, setHistories] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/mypage/history');
        const result: ApiResponse<LoginHistory[]> = await response.json();

        if (response.ok && result.success) {
          setHistories(result.payload || []);
        } else {
          setError(result.message || '履歴の取得に失敗しました。');
        }
      } catch (err) {
        setError('ネットワークエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="p-8 bg-card text-card-foreground rounded-lg shadow-md border border-border">
        <h1 className="text-2xl font-bold mb-6">ログイン履歴</h1>
        {loading ? (
          <p>読み込み中...</p>
        ) : error ? (
          <p className="text-destructive">エラー: {error}</p>
        ) : histories.length === 0 ? (
          <p>ログイン履歴はありません。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-foreground/5">
                <tr>
                  <th className="py-3 px-4 border-b border-border text-left text-sm font-semibold">ログイン日時</th>
                  <th className="py-3 px-4 border-b border-border text-left text-sm font-semibold">IPアドレス</th>
                  <th className="py-3 px-4 border-b border-border text-left text-sm font-semibold">デバイス情報</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {histories.map((history) => (
                  <tr key={history.id} className="hover:bg-foreground/5">
                    <td className="py-3 px-4 whitespace-nowrap">
                      {new Date(history.loginAt).toLocaleString('ja-JP', {
                        year: 'numeric', month: '2-digit', day: '2-digit',
                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 font-mono text-sm">{history.ipAddress}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{history.userAgent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}