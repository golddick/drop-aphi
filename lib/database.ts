import { PrismaClient } from "./generated/prisma";

// Type-safe global Prisma instance (prevents multiple clients in dev)
const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

// Create a new Prisma client
function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    errorFormat: "minimal",
    ...(process.env.DATABASE_URL && {
      datasources: { db: { url: process.env.DATABASE_URL } },
    }),
  });
}

// Use cached client in dev to avoid creating multiple instances
export const database = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = database;

// Simple health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await database.$queryRaw`SELECT 1`;
    console.log("✅ Database connection healthy");
    return true;
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    return false;
  }
}

// Helper for safe operations
export async function withDatabase<T>(operation: (db: PrismaClient) => Promise<T>): Promise<T> {
  try {
    return await operation(database);
  } catch (err) {
    console.error("Database operation failed:", err);
    throw err;
  }
}
