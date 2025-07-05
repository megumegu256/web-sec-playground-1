'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/app/_contexts/AuthContext';
import Header from '@/app/_components/Header';
import { useAuth } from './_contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <AppBody>{children}</AppBody>
    </AuthProvider>
  );
}

function AppBody({ children }: { children: React.ReactNode }) {
  const { theme } = useAuth();

  return (
    // ▼▼▼<html>タグにクラスを適用▼▼▼
    <html lang="ja" className={theme}>
      <head>
        <title>Playground</title>
        <meta name="description" content="A playground for web security learning." />
      </head>
      {/* ▼▼▼<body>のクラスをテーマ対応に修正▼▼▼ */}
      <body className={`${inter.className} bg-background text-foreground`}>
        <Header />
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}