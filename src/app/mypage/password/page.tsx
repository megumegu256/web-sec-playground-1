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
  // サーバーからのエラーメッセージを管理するState
  const [serverError, setServerError] = useState('');
  // 成功メッセージを表示するためのState
  const [successMessage, setSuccessMessage] = useState('');
  // フォームの送信中状態を管理するState
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset, // フォームをリセットする関数
  } = useForm<ChangePasswordRequest>({
    resolver: zodResolver(changePasswordRequestSchema),
  });

  // フォーム送信時の処理
  const onSubmit = async (data: ChangePasswordRequest) => {
    // エラーメッセージと成功メッセージをリセット
    setServerError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      // Server Actionを呼び出す
      const res = await changePasswordAction(data);

      if (!res.success) {
        // Server Actionから返されたエラーメッセージを設定
        setServerError(res.message || 'パスワードの変更に失敗しました。');
      } else {
        // 成功メッセージを設定し、フォームをリセット
        setSuccessMessage('パスワードが正常に変更されました。');
        reset();
      }
    } catch (e) {
      // 予期せぬエラーが発生した場合
      setServerError('予期せぬエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">パスワードの変更</h1>
      
      {/* 成功メッセージの表示 */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative mb-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      <div className="bg-white p-6 shadow-md rounded-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 現在のパスワード入力フィールド */}
          <TextInputField
            label="現在のパスワード"
            type="password"
            id="currentPassword"
            {...register('currentPassword')}
            error={errors.currentPassword?.message}
            autoComplete="current-password"
          />

          {/* 新しいパスワード入力フィールド */}
          <TextInputField
            label="新しいパスワード"
            type="password"
            id="newPassword"
            {...register('newPassword')}
            error={errors.newPassword?.message}
            autoComplete="new-password"
          />

          {/* 新しいパスワード（確認用）入力フィールド */}
          <TextInputField
            label="新しいパスワード（確認用）"
            type="password"
            id="confirmPassword"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
          />
          
          {/* サーバーからのエラーメッセージ表示 */}
          <ErrorMsgField message={serverError} />
          
          {/* 送信ボタン */}
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
