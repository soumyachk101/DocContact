// POST /api/doctors/:id/advance (auth required) — testing helper that
// bumps the doctor's currentToken by one and emits a queue event so
// connected SSE clients see the change immediately.

import { ok, errorToResponse, fail } from '@server/http';
import { withAuth } from '@server/withAuth';
import { advanceQueue, getDoctor } from '@server/doctors/service';
import { emitQueueUpdate } from '@server/queue-bus';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withAuth<{ params: Promise<{ id: string }> }>(async (_req, ctx) => {
    try {
        const { id } = await ctx.params;
        // Authorization: only the doctor who owns this listing, an admin,
        // or the clinic owner under whose clinic this doctor works, may advance.
        const doctor = await getDoctor(id);
        const isOwner = doctor.userId !== null && doctor.userId === Number(ctx.user.id);
        const isAdmin = ctx.user.role === 'admin';
        
        let isClinicOwner = false;
        if (doctor.clinicId) {
            const clinic = await prisma.clinic.findFirst({
                where: { id: doctor.clinicId, userId: Number(ctx.user.id) }
            });
            isClinicOwner = !!clinic;
        }

        if (!isOwner && !isAdmin && !isClinicOwner) {
            return fail(403, 'Unauthorized to advance this queue.', 'FORBIDDEN');
        }
        const updated = await advanceQueue(id);
        emitQueueUpdate({ doctorId: updated.id, newCurrentToken: updated.currentToken });
        return ok({ doctor: updated });
    } catch (err) {
        return errorToResponse(err);
    }
});
