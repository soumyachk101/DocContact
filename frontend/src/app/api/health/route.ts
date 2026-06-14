// Health check — used by the smoke test.
// Intentionally minimal: no DB query, no env dump, no version string.
// Anything more is information disclosure to anyone who can reach the
// endpoint (which on Vercel is the public internet).

import { ok } from '@server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    return ok({ ok: true, ts: new Date().toISOString() });
}
