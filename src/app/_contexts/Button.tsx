'use client';

import React from 'react';

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
        w-full px-4 py-2 font-bold text-white rounded-md
        focus:outline-none focus:shadow-outline
        disabled:bg-gray-400 disabled:cursor-not-allowed
        
        {/* ▼▼▼ ここを修正 ▼▼▼ */}
        bg-primary hover:bg-primary/80
        
        ${className}
      `}
    >
      {children}
    </button>
  );
};