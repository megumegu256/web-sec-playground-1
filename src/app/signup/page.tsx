'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { SignupRequest } from '@/app/_types/SignupRequest';
import { signupRequestSchema } from '@/app/_types/SignupRequest';
import { Button } from '@/app/_components/Button';
import { ErrorMsgField } from '@/app/_components/ErrorMsgField';
import { TextInputField } from '@/app/_components/TextInputField';
import Link from 'next/link';

export default function SignupPage() {
  // サーバーからの成功・エラーメッセージを管理
  const [successMessage, setSuccessMessage] = useState('');
  const [serverError, setServerError] = useState('');
  // フォーム送信中の状態を管理
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupRequest>({
    resolver: zodResolver(signupRequestSchema), // Zodスキーマをバリデーションに利用
  });

  // フォーム送信時の処理
  const onSubmit = async (data: SignupRequest) => {
    setIsSubmitting(true);
    setServerError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setServerError(result.message || '登録に失敗しました。');
      } else {
        setSuccessMessage(result.message + ' ログインページへ移動します。');
        // 成功したら2秒後にログインページへリダイレクト
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (e) {
      setServerError('ネットワークエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">新規登録</h1>

        {/* 成功メッセージ */}
        {successMessage && (
          <div className="p-3 text-sm text-center text-green-800 bg-green-100 border border-green-400 rounded-md">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TextInputField
            label="お名前"
            type="text"
            {...register('name')}
            error={errors.name?.message}
          />
          <TextInputField
            label="メールアドレス"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />
          <TextInputField
            label="パスワード"
            type="password"
            {...register('password')}
            error={errors.password?.message}
            placeholder="8文字以上、大小英数字を含む"
          />

          {/* サーバーエラー */}
          <ErrorMsgField message={serverError} />

          <div className="pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '登録中...' : '登録する'}
            </Button>
          </div>
        </form>

        <div className="text-sm text-center">
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            既にアカウントをお持ちですか？ ログイン
          </Link>
        </div>
      </div>
    </div>
  );
}