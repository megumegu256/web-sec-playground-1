'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ChangePasswordRequest } from '@/app/_types/ChangePasswordRequest';
import { changePasswordRequestSchema } from '@/app/_types/ChangePasswordRequest';
import { Button } from '@/app/_components/Button';
import { ErrorMsgField } from '@/app/_components/ErrorMsgField';
import { TextInputField } from '@/app/_components/TextInputField';

export default function PasswordChangePage() {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordRequest>({
    resolver: zodResolver(changePasswordRequestSchema),
  });

  // ▼▼▼ ここに処理を追記して修正 ▼▼▼
  const onSubmit = async (data: ChangePasswordRequest) => {
    setIsSubmitting(true);
    setServerError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/mypage/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setServerError(result.message || 'パスワードの変更に失敗しました。');
      } else {
        setSuccessMessage('パスワードが正常に変更されました。2秒後にメインページへ戻ります。');
        reset();
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (e) {
      setServerError('ネットワークエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">パスワードの変更</h1>
        {successMessage && (
          <div className="p-3 text-sm text-center text-green-800 bg-green-100 border border-green-400 rounded-md">
            {successMessage}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TextInputField
            label="現在のパスワード"
            type="password"
            {...register('currentPassword')}
            error={errors.currentPassword?.message}
            autoComplete="current-password"
            isPasswordVisible={showPasswords}
          />
          <TextInputField
            label="新しいパスワード"
            type="password"
            {...register('newPassword')}
            error={errors.newPassword?.message}
            autoComplete="new-password"
            placeholder="8文字以上、大小英数字を含む"
            isPasswordVisible={showPasswords}
          />
          <TextInputField
            label="新しいパスワード（確認用）"
            type="password"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
            isPasswordVisible={showPasswords}
          />
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
            <Button type="submit" disabled={isSubmitting || !!successMessage}>
              {isSubmitting ? '処理中...' : '変更する'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}