'use client';

import React from 'react';

// ボタンコンポーネントが受け取るプロパティ（引数）の型を定義
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  className?: string;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      {...props}
      className={`
        w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md
        hover:bg-blue-700 focus:outline-none focus:shadow-outline
        disabled:bg-gray-400 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
};