// POST /api/doctors/:id/reset (auth required) — testing helper that
// resets the doctor's currentToken to 0 and emits a queue event.

import { ok, errorToResponse, fail } from '@server/http';
import { withAuth } from '@server/withAuth';
import { resetQueue, getDoctor } from '@server/doctors/service';
import { emitQueueUpdate } from '@server/queue-bus';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withAuth<{ params: Promise<{ id: string }> }>(async (_req, ctx) => {
    try {
        const { id } = await ctx.params;
        // Authorization: only the owning doctor, an admin, or the clinic
        // owner under whose clinic this doctor works, may reset the queue.
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
            return fail(403, 'Unauthorized to reset this queue.', 'FORBIDDEN');
        }
        const updated = await resetQueue(id);
        emitQueueUpdate({ doctorId: updated.id, newCurrentToken: 0 });
        return ok({ doctor: updated });
    } catch (err) {
        return errorToResponse(err);
    }
});
