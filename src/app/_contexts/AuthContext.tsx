'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';

type UserProfile = { id: string; email: string; name: string | null; };
type ApiResponse<T> = { success: boolean; payload: T; message?: string; };

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: any;
  logout: () => Promise<void>;
  theme: string;
  setTheme: (theme: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetcher = (url: string) =>
  fetch(url, { credentials: 'same-origin' }).then((res) => res.json());

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, error, isLoading } = useSWR<ApiResponse<UserProfile | null>>(
    '/api/auth',
    fetcher,
    { revalidateOnFocus: false }
  );
  const user = data?.success ? data.payload : null;

  const [theme, setThemeState] = useState('light'); // デフォルトテーマをlightに変更

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') || 'light';
    setThemeState(savedTheme);
  }, []);

  const setTheme = (newTheme: string) => {
    localStorage.setItem('app-theme', newTheme);
    setThemeState(newTheme);
  };

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
    await mutate('/api/auth', undefined, { revalidate: false });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, logout, theme, setTheme }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};