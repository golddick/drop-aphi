

import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined; // Use `undefined` instead of `PrismaClient` for type safety
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // In production, use a global Prisma Client to avoid creating multiple instances
  if (!global.prisma) {
    console.log('Creating global Prisma client instance in production environment');
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
} else {
  // In non-production environments, create a new Prisma Client instance
  console.log('Creating new Prisma client instance in non-production environment');
  prisma = new PrismaClient();
}

export const database = prisma;
