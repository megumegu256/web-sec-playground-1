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
  const [successMessage, setSuccessMessage] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignupRequest>({
    resolver: zodResolver(signupRequestSchema),
  });

  const onSubmit = async (data: SignupRequest) => {
    setIsSubmitting(true);
    setServerError('');
    setSuccessMessage('');

    try {
      // ▼▼▼ この部分を修正 ▼▼▼
      // 'confirmPassword' を除外せずに、フォームの全データを送信する
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      // ▲▲▲ 修正ここまで ▲▲▲

      const result = await response.json();

      if (!response.ok || !result.success) {
        setServerError(result.message || '登録に失敗しました。');
      } else {
        setSuccessMessage(result.message + ' ログインページへ移動します。');
        reset();
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
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 space-y-6 bg-card text-card-foreground rounded-lg shadow-md border border-border">
        <h1 className="text-2xl font-bold text-center">新規登録</h1>
        {successMessage && (
          <div className="p-3 text-sm text-center text-green-700 bg-green-100 border border-green-400 rounded-md">
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
            isPasswordVisible={showPasswords}
          />
          <TextInputField
            label="パスワード（確認用）"
            type="password"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
            isPasswordVisible={showPasswords}
          />
          <div className="flex items-center">
            <input
              id="show-passwords"
              type="checkbox"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
              className="w-4 h-4 rounded border-input bg-card text-primary focus:ring-ring"
            />
            <label htmlFor="show-passwords" className="ml-2 block text-sm">
              パスワードを表示する
            </label>
          </div>
          <ErrorMsgField message={serverError} />
          <div className="pt-2">
            <Button type="submit" disabled={isSubmitting || !!successMessage}>
              {isSubmitting ? '登録中...' : '登録する'}
            </Button>
          </div>
        </form>
        <div className="text-sm text-center">
          <Link href="/login" className="font-medium text-primary hover:underline">
            既にアカウントをお持ちですか？ ログイン
          </Link>
        </div>
      </div>
    </div>
  );
}