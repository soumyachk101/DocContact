// Auth.js v5 client + server barrel.
//
// On the server, callers should `import { auth, signIn, signOut } from
// '@/lib/auth'` — this module re-exports them from the root `auth.ts`.
// On the client, only `signIn` and `signOut` are exposed (no `auth`).

export { auth, signIn, signOut } from '../../auth';
export { handlers } from '../../auth';
