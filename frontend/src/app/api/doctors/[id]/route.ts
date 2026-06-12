import { ok, errorToResponse, fail } from '@server/http';
import { getDoctor, updateDoctorSettings } from '@server/doctors/service';
import { withAuth } from '@server/withAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await ctx.params;
        const doctor = await getDoctor(id);
        return ok({ doctor });
    } catch (err) {
        return errorToResponse(err);
    }
}

export const PUT = withAuth<{ params: Promise<{ id: string }> }>(
    async (req, ctx) => {
        try {
            const { id } = await ctx.params;
            const doctor = await getDoctor(id);

            const isOwner = doctor.userId === Number(ctx.user.id);
            const isAdmin = ctx.user.role === 'admin';

            if (!isOwner && !isAdmin) {
                return fail(403, 'Unauthorized to update this doctor listing.', 'FORBIDDEN');
            }

            const body = await req.json().catch(() => ({}));
            
            const updateData: {
                available?: boolean;
                maxTokens?: number;
                fees?: number;
                timings?: string;
                days?: string;
            } = {};

            if (typeof body.available === 'boolean') updateData.available = body.available;
            if (typeof body.maxTokens === 'number') updateData.maxTokens = body.maxTokens;
            if (typeof body.fees === 'number') updateData.fees = body.fees;
            if (typeof body.timings === 'string') updateData.timings = body.timings;
            if (typeof body.days === 'string') updateData.days = body.days;

            const updated = await updateDoctorSettings(id, updateData);
            return ok({ doctor: updated });
        } catch (err) {
            return errorToResponse(err);
        }
    }
);
