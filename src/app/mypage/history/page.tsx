'use client';

import { useEffect, useState } from 'react';
import type { LoginHistory } from '@prisma/client';
import type { ApiResponse } from '@/app/_types/ApiResponse';

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

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-4">ログイン履歴</h1>
        <p>読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-4">ログイン履歴</h1>
        <p className="text-red-500">エラー: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">ログイン履歴</h1>
      {histories.length === 0 ? (
        <p>ログイン履歴はありません。</p>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">ログイン日時</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">IPアドレス</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">デバイス情報</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {histories.map((history) => (
                <tr key={history.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 whitespace-nowrap">
                    {new Date(history.loginAt).toLocaleString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-4 font-mono text-sm">
                    {history.ipAddress}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    {history.userAgent}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
