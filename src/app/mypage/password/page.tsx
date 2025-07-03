'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordRequestSchema, type ChangePasswordRequest } from '@/app/_types/ChangePasswordRequest';
import { changePasswordAction } from '@/app/_actions/changePassword';
import { TextInputField } from '@/app/_components/TextInputField';
import { Button } from '@/app/_components/Button';
import { ErrorMsgField } from '@/app/_components/ErrorMsgField';

export default function PasswordChangePage() {
  // 認証チェックはレイアウトに任せるため、このページからは削除。

  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordRequest>({
    resolver: zodResolver(changePasswordRequestSchema),
  });

  const onSubmit = async (data: ChangePasswordRequest) => {
    setServerError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const res = await changePasswordAction(data);
      if (!res.success) {
        setServerError(res.message || 'パスワードの変更に失敗しました。');
      } else {
        setSuccessMessage('パスワードが正常に変更されました。');
        reset();
      }
    } catch (e) {
      setServerError('予期せぬエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">パスワードの変更</h1>
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative mb-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      <div className="bg-white p-6 shadow-md rounded-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TextInputField
            label="現在のパスワード"
            type="password"
            id="currentPassword"
            placeholder="現在使用中のパスワード"
            {...register('currentPassword')}
            error={errors.currentPassword?.message}
            autoComplete="current-password"
          />

          <TextInputField
            label="新しいパスワード"
            type="password"
            id="newPassword"
            placeholder="8文字以上で入力してください"
            {...register('newPassword')}
            error={errors.newPassword?.message}
            autoComplete="new-password"
          />

          <TextInputField
            label="新しいパスワード（確認用）"
            type="password"
            id="confirmPassword"
            placeholder="新しいパスワードをもう一度入力"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
          />
          
          <ErrorMsgField message={serverError} />
          
          <div className="pt-2">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? '処理中...' : 'パスワードを変更する'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
