'use client';

import React from 'react';

interface ErrorMsgFieldProps {
  message?: string | null;
}

export const ErrorMsgField: React.FC<ErrorMsgFieldProps> = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <div className="p-3 my-2 text-sm text-center text-red-800 bg-red-100 border border-red-400 rounded-md" role="alert">
      {message}
    </div>
  );
};