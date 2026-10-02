import { PrismaClient } from "@prisma/client";

/**
 * Single PrismaClient instance for the whole server process.
 * Creating a new client per route file (as the older routes do) exhausts the
 * database connection pool, especially during dev hot-reloads.
 *
 * The global cache below prevents multiple instances across HMR reloads.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
