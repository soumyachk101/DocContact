// Full NextAuth — imports Prisma + bcryptjs so it can only run in the
// Node.js runtime. The slim edge-safe config in `auth.config.ts` is
// what `middleware.ts` uses; this file powers the API route handlers
// and server actions.

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
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
                // OAuth-only accounts (e.g. Google sign-in) have no
                // password hash; refuse the credentials login rather
                // than passing an empty string to bcrypt.
                if (!user.passwordHash) return null;
                if (!bcrypt.compareSync(password, user.passwordHash)) return null;

                return {
                    id: String(user.id),
                    email: user.email,
                    name: user.name,
                    role: user.role as 'patient' | 'doctor' | 'admin',
                };
            },
        }),
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, account }) {
            if (account?.provider === 'google') {
                const email = user.email?.trim().toLowerCase();
                if (!email) return false;

                const existingUser = await prisma.user.findUnique({
                    where: { email },
                });

                if (!existingUser) {
                    await prisma.user.create({
                        data: {
                            email,
                            name: user.name ?? 'Google User',
                            role: 'patient',
                            passwordHash: '',
                        },
                    });
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            if (user) {
                if (account?.provider === 'google') {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: user.email?.trim().toLowerCase() },
                    });
                    if (dbUser) {
                        token.id = String(dbUser.id);
                        token.role = dbUser.role;
                    }
                } else {
                    const u = user as { id?: string; role?: string };
                    token.id = u.id ?? '';
                    token.role = u.role ?? 'patient';
                }
            }
            return token;
        },
    },
});
