'use client';

// Thin client wrapper around next-auth/react's SessionProvider.
// Server components can read `auth()` from `@/lib/auth`; the client side
// needs SessionProvider to use `useSession()`.

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

export function AuthSessionProvider({ children }: { children: ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>;
}
