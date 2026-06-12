// Edge middleware — uses the slim `auth.config.ts` (no Prisma) to do
// an optimistic auth redirect. Real authorization happens in route
// handlers and server components via the `auth()` helper.

import NextAuth from 'next-auth';
import { authConfig } from '../auth.config';

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
    // Skip Next internals, the Auth.js endpoints, and any static asset.
    matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.svg$).*)'],
};
