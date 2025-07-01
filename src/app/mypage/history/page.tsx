// src/app/mypage/history/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { getLoginHistoryAction } from '@/app/_actions/getLoginHistory';
import type { LoginHistory } from '@prisma/client';

export default function LoginHistoryPage() {
  const [histories, setHistories] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getLoginHistoryAction();
        if (res.success && res.payload) {
          setHistories(res.payload);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError('履歴の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>エラー: {error}</div>;
  }

  return (
    <div>
      <h1>ログイン履歴</h1>
      {histories.length === 0 ? (
        <p>ログイン履歴はありません。</p>
      ) : (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid black', padding: '8px' }}>ログイン日時</th>
              <th style={{ border: '1px solid black', padding: '8px' }}>IPアドレス</th>
              <th style={{ border: '1px solid black', padding: '8px' }}>デバイス情報</th>
            </tr>
          </thead>
          <tbody>
            {histories.map((history) => (
              <tr key={history.id}>
                <td style={{ border: '1px solid black', padding: '8px' }}>
                  {new Date(history.loginAt).toLocaleString('ja-JP')}
                </td>
                <td style={{ border: '1px solid black', padding: '8px' }}>
                  {history.ipAddress}
                </td>
                <td style={{ border: '1px solid black', padding: '8px' }}>
                  {history.userAgent}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}