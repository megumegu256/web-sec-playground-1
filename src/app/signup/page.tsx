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
  // ▼▼▼ パスワード表示状態のstateを追加 ▼▼▼
  const [showPasswords, setShowPasswords] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupRequest>({
    resolver: zodResolver(signupRequestSchema),
  });

  const onSubmit = async (data: SignupRequest) => {
    // (onSubmitの中身は変更なし)
    // ...
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">新規登録</h1>
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
            isPasswordVisible={showPasswords} // stateを渡す
          />
          <TextInputField
            label="パスワード（確認用）"
            type="password"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
            isPasswordVisible={showPasswords} // stateを渡す
          />
          {/* ▼▼▼ 表示切り替えチェックボックスを追加 ▼▼▼ */}
          <div className="flex items-center">
            <input
              id="show-passwords"
              type="checkbox"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="show-passwords" className="ml-2 text-sm font-medium text-gray-900">
              パスワードを表示する
            </label>
          </div>
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