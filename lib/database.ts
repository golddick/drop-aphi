import { PrismaClient } from "./generated/prisma";

// Type-safe global Prisma instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    // Optimized logs for serverless
    log: process.env.NODE_ENV === "development" 
      ? ["query", "error", "warn"] 
      : ["error"],
    
    // Better error handling for production
    errorFormat: "minimal",
    
    // Connection timeout for serverless environments
    ...(process.env.VERCEL || process.env.NODE_ENV === "production") && {
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    },
  });

  // Add graceful shutdown for non-serverless environments
  if (typeof process !== 'undefined') {
    const signals = ['SIGINT', 'SIGTERM', 'SIGHUP'] as const;
    signals.forEach(signal => {
      process.on(signal, async () => {
        await client.$disconnect();
        process.exit(0);
      });
    });
  }

  return client;
}

export const database = globalForPrisma.prisma ?? createPrismaClient();

// Only cache in development to prevent memory leaks in serverless
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = database;
}

// Enhanced health check for serverless
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // Fast timeout for serverless functions
    await Promise.race([
      database.$queryRaw`SELECT 1`,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 3000)
      )
    ]);
    console.log("✅ Database connection healthy");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// Connection management for different environments
export async function withDatabase<T>(
  operation: (db: PrismaClient) => Promise<T>
): Promise<T> {
  try {
    return await operation(database);
  } catch (error) {
    console.error('Database operation failed:', error);
    throw error;
  }
}