import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | undefined;

export function getPrisma() {
  if (!prisma) {
    // Pass the URL explicitly so tests don't rely on process.env timing
    prisma = new PrismaClient({
      datasources: { db: { url: process.env.DATABASE_URL } },
    });
  }
  return prisma;
}

// convenience named export used across code
export const prismaClient = getPrisma();
export { PrismaClient }; // if you need the class elsewhere
