'use client';

import React, { forwardRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

// このコンポーネントが受け取るプロパティの型を定義
interface TextInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextInputField = forwardRef<HTMLInputElement, TextInputFieldProps>(
  ({ label, error, ...props }, ref) => {
    const id = props.id || props.name;
    // パスワードの表示状態を管理するためのState
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // パスワードの表示/非表示を切り替える関数
    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    const isPasswordField = props.type === 'password';

    return (
      <div>
        <label htmlFor={id} className="block mb-2 text-sm font-bold text-gray-700">
          {label}
        </label>
        <div className="relative">
          <input
            {...props}
            // isPasswordVisibleがtrueなら'text'に、そうでなければ元のtype（'password'など）にする
            type={isPasswordField ? (isPasswordVisible ? 'text' : 'password') : props.type}
            ref={ref}
            id={id}
            className={`
              w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none
              focus:outline-none focus:shadow-outline
              ${isPasswordField ? 'pr-10' : ''}
              ${error ? 'border-red-500' : ''}
            `}
          />
          {/* typeが'password'の場合のみ、切り替えボタンを表示 */}
          {isPasswordField && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 focus:outline-none"
              aria-label={isPasswordVisible ? "パスワードを非表示" : "パスワードを表示"}
            >
              <FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye} />
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-xs italic text-red-500">{error}</p>}
      </div>
    );
  }
);

TextInputField.displayName = 'TextInputField';