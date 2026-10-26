import { PrismaClient } from '@prisma/client';

// One client (one connection pool) for the whole process. Every route imports this instead of
// creating its own, otherwise the pools add up and exhaust the database's connection slots.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
