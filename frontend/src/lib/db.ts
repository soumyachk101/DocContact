// Prisma 7 client singleton — pinned to `globalThis` so the Next.js
// dev server's HMR doesn't create a new connection on every reload.

import { PrismaClient } from '@generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
    // eslint-disable-next-line no-var
    var __zenPrisma: PrismaClient | undefined;
}

function makeClient(): PrismaClient {
    const url = process.env.DATABASE_URL;
    if (!url) {
        throw new Error('DATABASE_URL is not set. Did you copy .env.example to .env?');
    }
    const adapter = new PrismaPg(url);
    return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = global.__zenPrisma ?? makeClient();

if (process.env.NODE_ENV !== 'production') {
    global.__zenPrisma = prisma;
}
