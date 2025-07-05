'use client';

import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary';
};

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  ...props
}) => {
  const baseStyle = 'w-full px-4 py-2 font-bold rounded-md focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyle = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  };

  return (
    <button
      {...props}
      className={`${baseStyle} ${variantStyle[variant]} ${className}`}
    >
      {children}
    </button>
  );
};