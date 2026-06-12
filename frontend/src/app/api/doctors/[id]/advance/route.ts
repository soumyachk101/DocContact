// POST /api/doctors/:id/advance (auth required) — testing helper that
// bumps the doctor's currentToken by one and emits a queue event so
// connected SSE clients see the change immediately.

import { ok, errorToResponse } from '@server/http';
import { withAuth } from '@server/withAuth';
import { advanceQueue } from '@server/doctors/service';
import { emitQueueUpdate } from '@server/queue-bus';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withAuth<{ params: Promise<{ id: string }> }>(async (_req, ctx) => {
    try {
        const { id } = await ctx.params;
        const doctor = await advanceQueue(id);
        emitQueueUpdate({ doctorId: doctor.id, newCurrentToken: doctor.currentToken });
        return ok({ doctor });
    } catch (err) {
        return errorToResponse(err);
    }
});
