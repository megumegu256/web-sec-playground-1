'use client';

import React, { forwardRef } from 'react';

// このコンポーネントが受け取るプロパティの型を定義
interface TextInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextInputField = forwardRef<HTMLInputElement, TextInputFieldProps>(
  ({ label, error, ...props }, ref) => {
    const id = props.id || props.name;

    return (
      <div>
        <label htmlFor={id} className="block mb-2 text-sm font-bold text-gray-700">
          {label}
        </label>
        <input
          {...props}
          ref={ref}
          id={id}
          className={`
            w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none 
            focus:outline-none focus:shadow-outline
            ${error ? 'border-red-500' : ''}
          `}
        />
        {error && <p className="mt-1 text-xs italic text-red-500">{error}</p>}
      </div>
    );
  }
);

TextInputField.displayName = 'TextInputField';