'use client';

import Link from 'next/link';
import { useAuth } from '@/app/_contexts/AuthContext';

export default function Header() {
  const { user, isLoading, logout } = useAuth();

  return (
    <header className="bg-card text-card-foreground shadow-md border-b border-border">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Playground
        </Link>
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="text-sm">Loading...</div>
          ) : user ? (
            <>
              <span className="text-sm">{user.email}</span>
              <button
                onClick={logout}
                className="text-sm text-primary hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-primary hover:underline">
                Login
              </Link>
              <Link href="/signup" className="text-sm text-primary hover:underline">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}