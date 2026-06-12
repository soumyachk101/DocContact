// POST /api/internal/simulator/tick
// Cron-driven fallback for Vercel (where the in-process simulator
// cannot run). Same `tick()` function the local simulator uses.

import { ok, fail, errorToResponse } from '@server/http';
import { tick } from '@server/simulator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const expected = process.env.QUEUE_CRON_SECRET;
    if (expected) {
        const auth = req.headers.get('authorization');
        if (auth !== `Bearer ${expected}`) {
            return fail(401, 'Unauthorized.', 'UNAUTHENTICATED');
        }
    }
    try {
        const result = await tick();
        return ok(result);
    } catch (err) {
        return errorToResponse(err);
    }
}
