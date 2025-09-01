import { PrismaClient } from '@prisma/client';

// Create a singleton instance of PrismaClient
const prismaClientSingleton = () => {
  return new PrismaClient();
};

// Use type any to avoid issues with global namespace
type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

// Create global variable for PrismaClient
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

// Export singleton instance of PrismaClient
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// In development, reset the singleton on HMR
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;