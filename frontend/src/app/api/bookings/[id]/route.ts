import { ok, errorToResponse } from '@server/http';
import { withAuth } from '@server/withAuth';
import { cancelBooking } from '@server/bookings/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const DELETE = withAuth<{ params: Promise<{ id: string }> }>(
    async (_req, ctx) => {
        try {
            const { id } = await ctx.params;
            const userId = Number(ctx.user.id);
            const role = ctx.user.role;
            await cancelBooking(userId, id, role);
            return ok({ success: true });
        } catch (err) {
            return errorToResponse(err);
        }
    }
);
