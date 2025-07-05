'use client';

import Link from 'next/link';
import { useAuth } from '@/app/_contexts/AuthContext';
import { Button } from './Button';

export default function Header() {
  const { user, isLoading, logout } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-gray-800">
          WebSec Playground
        </Link>
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : user ? (
            <>
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={logout}
                className="text-sm text-blue-600 hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-blue-600 hover:underline">
                Login
              </Link>
              <Link href="/signup" className="text-sm text-blue-600 hover:underline">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}