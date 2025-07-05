import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/app/_contexts/AuthContext';
import Header from '@/app/_components/Header'; // この行のコメントを解除

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Web Security Playground',
  description: 'A playground for web security learning.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-gray-100`}>
        <AuthProvider>
          <Header /> {/* この行のコメントを解除 */}
          <main className="container mx-auto p-4">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}