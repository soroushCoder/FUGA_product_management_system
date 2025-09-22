import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;

export function getPrisma() {
  if (!prisma) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is required for DB access');
    prisma = new PrismaClient({ datasources: { db: { url } } });
  }
  return prisma;
}

// handy for tests if you ever need to re-read env and rebuild
export async function resetPrisma() {
  if (prisma) await prisma.$disconnect();
  prisma = null;
}

export { PrismaClient };
