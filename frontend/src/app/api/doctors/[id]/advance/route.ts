// POST /api/doctors/:id/advance (auth required) — testing helper that
// bumps the doctor's currentToken by one and emits a queue event so
// connected SSE clients see the change immediately.

import { ok, errorToResponse, fail } from '@server/http';
import { withAuth } from '@server/withAuth';
import { advanceQueue, getDoctor } from '@server/doctors/service';
import { emitQueueUpdate } from '@server/queue-bus';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withAuth<{ params: Promise<{ id: string }> }>(async (_req, ctx) => {
    try {
        const { id } = await ctx.params;
        // Authorization: only the doctor who owns this listing, or an
        // admin, may advance the queue. Previously any logged-in user
        // could advance any doctor's queue.
        const doctor = await getDoctor(id);
        const isOwner = doctor.userId !== null && doctor.userId === Number(ctx.user.id);
        const isAdmin = ctx.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return fail(403, 'Unauthorized to advance this queue.', 'FORBIDDEN');
        }
        const updated = await advanceQueue(id);
        emitQueueUpdate({ doctorId: updated.id, newCurrentToken: updated.currentToken });
        return ok({ doctor: updated });
    } catch (err) {
        return errorToResponse(err);
    }
});
