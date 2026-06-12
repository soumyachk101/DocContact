// Module augmentation for NextAuth so `session.user.id` and `role` are typed
// across server components, route handlers and the client.

import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role: 'patient' | 'doctor';
        } & DefaultSession['user'];
    }

    interface User {
        id?: string;
        role?: 'patient' | 'doctor';
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: 'patient' | 'doctor';
    }
}
