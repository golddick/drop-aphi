import { PrismaClient } from "./generated/prisma";

// Proper global type declaration
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create and configure Prisma client
function createPrismaClient(): PrismaClient {
  console.log(`🛠️ Creating Prisma client in ${process.env.NODE_ENV} mode`);
  
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    errorFormat: "minimal",
    // Data Proxy specific optimizations
    ...(process.env.DATABASE_URL?.startsWith('prisma://') && {
      // Additional config for Data Proxy if needed
    }),
  });
}

// Global instance management
export const database = ((): PrismaClient => {
  if (process.env.NODE_ENV === "production") {
    // In production, always return a new instance or cached global
    if (!global.__prisma) {
      console.log("🌐 Creating global Prisma client instance in production");
      global.__prisma = createPrismaClient();
    }
    return global.__prisma;
  } else {
    // In development, use global instance to prevent too many connections
    if (!global.__prisma) {
      console.log("🔧 Creating new Prisma client instance in development");
      global.__prisma = createPrismaClient();
    }
    return global.__prisma;
  }
})();

// Optional: Add connection health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await database.$queryRaw`SELECT 1`;
    console.log("✅ Database connection healthy");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// Optional: Cleanup function for testing
export async function disconnectDatabase(): Promise<void> {
  if (global.__prisma) {
    await global.__prisma.$disconnect();
    global.__prisma = undefined;
  }
}



// import { PrismaClient } from "./generated/prisma";

// const globalForPrisma = globalThis as unknown as {
//   prisma?: PrismaClient;
// };

// export const database =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     log:
//       process.env.NODE_ENV === "development"
//         ? ["query", "error", "warn"]
//         : ["error"],
//     datasources: {
//       db: {
//         url: process.env.DATABASE_URL!,
//       },
//     },
//   });

// if (process.env.NODE_ENV !== "production")
//   globalForPrisma.prisma = database;
