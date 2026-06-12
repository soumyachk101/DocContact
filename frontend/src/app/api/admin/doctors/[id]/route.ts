import { ok, errorToResponse } from '@server/http';
import { withRole } from '@server/withAuth';
import { deleteDoctorProfile } from '@server/doctors/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const DELETE = withRole<{ params: Promise<{ id: string }> }>('admin')(
    async (_req, ctx) => {
        try {
            const { id } = await ctx.params;
            await deleteDoctorProfile(id);
            return ok({ success: true });
        } catch (err) {
            return errorToResponse(err);
        }
    }
);
