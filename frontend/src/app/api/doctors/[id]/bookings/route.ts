import { ok, errorToResponse, fail } from '@server/http';
import { getDoctor } from '@server/doctors/service';
import { listBookingsForDoctor } from '@server/bookings/service';
import { withAuth } from '@server/withAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAuth<{ params: Promise<{ id: string }> }>(
    async (_req, ctx) => {
        try {
            const { id } = await ctx.params;
            const doctor = await getDoctor(id);

            const isOwner = doctor.userId !== null && doctor.userId === Number(ctx.user.id);
            const isAdmin = ctx.user.role === 'admin';

            if (!isOwner && !isAdmin) {
                return fail(403, 'Unauthorized to view these bookings.', 'FORBIDDEN');
            }

            const bookings = await listBookingsForDoctor(id);
            return ok({ bookings });
        } catch (err) {
            return errorToResponse(err);
        }
    }
);
