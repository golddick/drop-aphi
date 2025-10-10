// lib/database.ts
import { PrismaClient } from "@prisma/client";

// ✅ Type-safe global Prisma instance to prevent multiple clients in dev
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// ✅ Create Prisma client with dynamic config
const createPrismaClient = () =>
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    errorFormat: process.env.NODE_ENV === "development" ? "pretty" : "minimal",
    datasources: {
      db: {
        url: process.env.DATABASE_URL ?? "",
      },
    },
  });

// ✅ Use cached instance in dev to avoid multiple connections
export const database = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = database;

// ✅ Simple health check (for monitoring or startup checks)
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await database.$queryRaw`SELECT 1`;
    console.log("✅ Database connection is healthy");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// ✅ Wrapper to safely execute Prisma operations with unified error handling
export async function withDatabase<T>(
  operation: (db: PrismaClient) => Promise<T>
): Promise<T> {
  try {
    return await operation(database);
  } catch (error) {
    console.error("❌ Prisma operation failed:", error);
    throw error;
  }
}
