// Edge middleware — uses the slim `auth.config.ts` (no Prisma) to do
// an optimistic auth redirect. Real authorization happens in route
// handlers and server components via the `auth()` helper.

import NextAuth from 'next-auth';
import { authConfig } from '../auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    // Defense-in-depth: never let the middleware follow an attacker-
    // controlled "next" redirect to an off-site URL. The auth.config
    // builds the redirect target from the same request, so this is
    // redundant for current callers, but it blocks any future
    // configuration that forwards nextUrl through.
    const next = req.nextUrl.searchParams.get('next');
    if (next && !next.startsWith('/')) {
        const url = req.nextUrl.clone();
        url.searchParams.delete('next');
        return Response.redirect(url);
    }
    return undefined;
});

export const config = {
    // Skip Next internals, the Auth.js endpoints, and any static asset.
    matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.svg$).*)'],
};
