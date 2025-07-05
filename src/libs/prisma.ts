import { PrismaClient } from '@prisma/client';

// PrismaClientのインスタンスをグローバルに保持するための設定
// これにより、開発中のホットリロードでインスタンスが増え続けるのを防ぎます。
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // ログを見たい場合は、以下のコメントを解除してください
    // log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}