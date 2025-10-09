import { PrismaClient } from "./generated/prisma";

declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  if (!global.prisma) {
    console.log("🌐 Creating global Prisma client instance in production");
    global.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL!, // ✅ must be defined in .env
        },
      },
    });
  }
  prisma = global.prisma;
} else {
  console.log("🛠️ Creating new Prisma client instance in development");
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL!, // ✅ must be defined in .env
      },
    },
  });
}

export const database = prisma;
