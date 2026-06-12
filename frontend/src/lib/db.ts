// Prisma 7 client singleton — pinned to `globalThis` so the Next.js
// dev server's HMR doesn't create a new connection on every reload.

import { PrismaClient } from '@generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
    // eslint-disable-next-line no-var
    var __zenPrisma: PrismaClient | undefined;
}

let _prisma: PrismaClient | undefined;

function getClient(): PrismaClient {
    if (global.__zenPrisma) {
        return global.__zenPrisma;
    }
    if (_prisma) {
        return _prisma;
    }

    const url = process.env.DATABASE_URL;
    if (!url) {
        throw new Error('DATABASE_URL is not set. Did you copy .env.example to .env?');
    }
    const adapter = new PrismaPg(url);
    const client = new PrismaClient({ adapter });

    if (process.env.NODE_ENV !== 'production') {
        global.__zenPrisma = client;
    } else {
        _prisma = client;
    }
    return client;
}

// Export a Proxy that intercepts all property access and forwards them to the lazily initialized client.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
    get(target, prop, receiver) {
        const client = getClient();
        const value = Reflect.get(client, prop);
        if (typeof value === 'function') {
            return value.bind(client);
        }
        return value;
    }
});
