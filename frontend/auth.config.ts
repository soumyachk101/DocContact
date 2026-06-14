// Edge-safe NextAuth config — used by `middleware.ts` and re-imported by
// the full `auth.ts`. This file MUST stay free of Prisma, bcryptjs, or
// anything that pulls in Node built-ins (it runs on the edge).

import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

const PROTECTED_PATHS = ['/tracker', '/apply', '/dashboard'];

function isProtected(pathname: string): boolean {
    return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export const authConfig: NextAuthConfig = {
    pages: {
        signIn: '/login',
    },
    session: { strategy: 'jwt' },
    // Empty placeholders — real configurations are added/merged in auth.ts
    providers: [
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            // Edge-safe stub — actual authorization happens in auth.ts.
            authorize: async () => null,
        }),
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
    ],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            
            // Never redirect API requests
            if (nextUrl.pathname.startsWith('/api')) {
                return true;
            }

            const isDashboard = nextUrl.pathname.startsWith('/dashboard');
            
            // 1. Protect dashboard paths
            if (isDashboard && !isLoggedIn) {
                return Response.redirect(new URL('/login', nextUrl));
            }

            // 2. Protect other designated paths
            if (isProtected(nextUrl.pathname) && !isLoggedIn) {
                const next = encodeURIComponent(nextUrl.pathname + nextUrl.search);
                return Response.redirect(new URL(`/login?next=${next}`, nextUrl));
            }

            // 3. Lock logged-in users inside their dashboard (redirect away from public pages)
            if (isLoggedIn) {
                const userRole = (auth?.user as { role?: string })?.role || 'patient';
                const dashboardPath = `/dashboard/${userRole}`;
                
                // Public landing pages and guest-only pages
                const PUBLIC_LANDING_PATHS = ['/', '/login', '/signup', '/tracker', '/apply', '/about'];
                const isPublicLanding = PUBLIC_LANDING_PATHS.includes(nextUrl.pathname) || nextUrl.pathname.startsWith('/doctors');
                
                if (isPublicLanding && nextUrl.pathname !== dashboardPath) {
                    return Response.redirect(new URL(dashboardPath, nextUrl));
                }
            }

            return true;
        },
        jwt({ token, user }) {
            if (user) {
                const u = user as { id?: string; role?: 'patient' | 'doctor' | 'admin' };
                token.id = u.id ?? '';
                token.role = u.role ?? 'patient';
            }
            return token;
        },
        session({ session, token }) {
            if (token && session.user) {
                const t = token as { id?: unknown; role?: unknown };
                session.user.id = typeof t.id === 'string' ? t.id : '';
                session.user.role = t.role === 'doctor' ? 'doctor' : t.role === 'admin' ? 'admin' : 'patient';
            }
            return session;
        },
    },
    trustHost: true,
};

export { isProtected };
