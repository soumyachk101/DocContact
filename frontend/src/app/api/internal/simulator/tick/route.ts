// POST /api/internal/simulator/tick
// Cron-driven fallback for Vercel (where the in-process simulator
// cannot run). Same `tick()` function the local simulator uses.
//
// Auth: a shared bearer secret in QUEUE_CRON_SECRET. When the secret
// is unset the endpoint is refused — there is no anonymous fallback,
// because unauthenticated callers would be able to force arbitrary
// queue advancement on every doctor.

import { ok, fail, errorToResponse } from '@server/http';
import { tick } from '@server/simulator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const expected = process.env.QUEUE_CRON_SECRET;
    if (!expected) {
        // Refuse rather than silently allow: if a deployment forgets to
        // configure the secret, the safe default is to reject.
        return fail(503, 'Simulator tick endpoint is disabled (missing QUEUE_CRON_SECRET).', 'DISABLED');
    }
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${expected}`) {
        return fail(401, 'Unauthorized.', 'UNAUTHENTICATED');
    }
    try {
        const result = await tick();
        return ok(result);
    } catch (err) {
        return errorToResponse(err);
    }
}
