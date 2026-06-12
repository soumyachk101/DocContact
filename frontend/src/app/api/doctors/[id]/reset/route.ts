// POST /api/doctors/:id/reset (auth required) — testing helper that
// resets the doctor's currentToken to 0 and emits a queue event.

import { ok, errorToResponse } from '@server/http';
import { withAuth } from '@server/withAuth';
import { resetQueue } from '@server/doctors/service';
import { emitQueueUpdate } from '@server/queue-bus';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withAuth<{ params: Promise<{ id: string }> }>(async (_req, ctx) => {
    try {
        const { id } = await ctx.params;
        const doctor = await resetQueue(id);
        emitQueueUpdate({ doctorId: doctor.id, newCurrentToken: 0 });
        return ok({ doctor });
    } catch (err) {
        return errorToResponse(err);
    }
});
