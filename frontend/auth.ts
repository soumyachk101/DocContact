// Full NextAuth — imports Prisma + bcryptjs so it can only run in the
// Node.js runtime. The slim edge-safe config in `auth.config.ts` is
// what `middleware.ts` uses; this file powers the API route handlers
// and server actions.

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';
import { prisma } from './src/lib/db';

const credentialsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(raw) {
                const parsed = credentialsSchema.safeParse(raw);
                if (!parsed.success) return null;
                const { email, password } = parsed.data;

                const user = await prisma.user.findUnique({
                    where: { email: email.trim().toLowerCase() },
                });
                if (!user) return null;
                if (!bcrypt.compareSync(password, user.passwordHash)) return null;

                return {
                    id: String(user.id),
                    email: user.email,
                    name: user.name,
                    role: user.role as 'patient' | 'doctor',
                };
            },
        }),
    ],
});
