'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { LoginRequest } from '@/app/_types/LoginRequest';
import { loginRequestSchema } from '@/app/_types/LoginRequest';
import { Button } from '@/app/_components/Button';
import { ErrorMsgField } from '@/app/_components/ErrorMsgField';
import { TextInputField } from '@/app/_components/TextInputField';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
  });

  const onSubmit = async (data: LoginRequest) => {
    setIsSubmitting(true);
    setServerError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setServerError(result.message || 'ログインに失敗しました。');
      } else {
        // ログイン成功後、認証状態のキャッシュを更新してUIを即時反映
        await mutate('/api/auth');
        // メインページにリダイレクト
        router.push('/');
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
        <h1 className="text-2xl font-bold text-center">ログイン</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          />

          <ErrorMsgField message={serverError} />

          <div className="pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'ログイン中...' : 'ログイン'}
            </Button>
          </div>
        </form>

        <div className="text-sm text-center">
          <Link href="/signup" className="font-medium text-blue-600 hover:underline">
            アカウントをお持ちでないですか？ 新規登録
          </Link>
        </div>
      </div>
    </div>
  );
}