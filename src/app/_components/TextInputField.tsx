'use client';

import React, { forwardRef } from 'react';

interface TextInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  isPasswordVisible?: boolean;
}

export const TextInputField = forwardRef<HTMLInputElement, TextInputFieldProps>(
  ({ label, error, isPasswordVisible, ...props }, ref) => {
    const id = props.id || props.name;
    const isPasswordField = props.type === 'password';

    return (
      <div>
        {/* ▼▼▼ ラベルの文字色を修正 ▼▼▼ */}
        <label htmlFor={id} className="block mb-2 text-sm font-bold text-card-foreground">
          {label}
        </label>
        <div className="relative">
          <input
            {...props}
            type={isPasswordField && isPasswordVisible ? 'text' : props.type}
            ref={ref}
            id={id}
            className={`
              w-full px-3 py-2 text-sm leading-tight rounded shadow appearance-none
              bg-background text-foreground
              border border-input
              focus:outline-none focus:ring-2 focus:ring-ring
              ${error ? 'border-destructive' : ''}
            `}
          />
        </div>
        {/* ▼▼▼ エラーメッセージの色を修正 ▼▼▼ */}
        {error && <p className="mt-1 text-xs italic text-destructive">{error}</p>}
      </div>
    );
  }
);

TextInputField.displayName = 'TextInputField';