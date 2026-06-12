// Health check — used by the smoke test.
import { ok } from '@server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    return ok({ ok: true, ts: new Date().toISOString() });
}
