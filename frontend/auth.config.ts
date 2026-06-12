// Edge-safe NextAuth config — used by `middleware.ts` and re-imported by
// the full `auth.ts`. This file MUST stay free of Prisma, bcryptjs, or
// anything that pulls in Node built-ins (it runs on the edge).

import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

const PUBLIC_PATHS = ['/', '/about', '/doctors', '/login', '/signup'];
const PROTECTED_PATHS = ['/tracker', '/apply'];

function isProtected(pathname: string): boolean {
    return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export const authConfig: NextAuthConfig = {
    pages: {
        signIn: '/login',
    },
    session: { strategy: 'jwt' },
    // Empty placeholder — the real Credentials provider with Prisma +
    // bcryptjs is added in `auth.ts` (Node runtime only). We still need
    // to declare it here so the module loads without runtime errors.
    providers: [
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            // Edge-safe stub — actual authorization happens in auth.ts.
            authorize: async () => null,
        }),
    ],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            if (isProtected(nextUrl.pathname) && !isLoggedIn) {
                const next = encodeURIComponent(nextUrl.pathname + nextUrl.search);
                return Response.redirect(new URL(`/login?next=${next}`, nextUrl));
            }
            if (isLoggedIn && PUBLIC_PATHS.includes(nextUrl.pathname) && nextUrl.pathname !== '/') {
                return true;
            }
            return true;
        },
        jwt({ token, user }) {
            if (user) {
                const u = user as { id?: string; role?: 'patient' | 'doctor' };
                token.id = u.id ?? '';
                token.role = u.role ?? 'patient';
            }
            return token;
        },
        session({ session, token }) {
            if (token && session.user) {
                const t = token as { id?: unknown; role?: unknown };
                session.user.id = typeof t.id === 'string' ? t.id : '';
                session.user.role = t.role === 'doctor' ? 'doctor' : 'patient';
            }
            return session;
        },
    },
    trustHost: true,
};

export { isProtected };
