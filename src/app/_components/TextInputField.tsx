'use client';

import React, { forwardRef } from 'react';

interface TextInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  // 親コンポーネントから表示状態を受け取るためのプロパティを追加
  isPasswordVisible?: boolean;
}

export const TextInputField = forwardRef<HTMLInputElement, TextInputFieldProps>(
  ({ label, error, isPasswordVisible, ...props }, ref) => {
    const id = props.id || props.name;
    const isPasswordField = props.type === 'password';

    return (
      <div>
        <label htmlFor={id} className="block mb-2 text-sm font-bold text-gray-700">
          {label}
        </label>
        <div className="relative">
          <input
            {...props}
            // 親から渡されたisPasswordVisibleに応じてtypeを変更
            type={isPasswordField && isPasswordVisible ? 'text' : props.type}
            ref={ref}
            id={id}
            className={`
              w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none
              focus:outline-none focus:shadow-outline
              ${error ? 'border-red-500' : ''}
            `}
          />
        </div>
        {error && <p className="mt-1 text-xs italic text-red-500">{error}</p>}
      </div>
    );
  }
);

TextInputField.displayName = 'TextInputField';