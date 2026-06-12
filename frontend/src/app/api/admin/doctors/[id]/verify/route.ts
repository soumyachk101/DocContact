import { ok, errorToResponse, fail } from '@server/http';
import { withRole } from '@server/withAuth';
import { verifyDoctor } from '@server/doctors/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withRole<{ params: Promise<{ id: string }> }>('admin')(
    async (req, ctx) => {
        try {
            const { id } = await ctx.params;
            const body = await req.json().catch(() => ({}));
            const isVerified = body.isVerified;
            if (typeof isVerified !== 'boolean') {
                return fail(400, 'isVerified must be a boolean.', 'VALIDATION');
            }
            const doctor = await verifyDoctor(id, isVerified);
            return ok({ doctor });
        } catch (err) {
            return errorToResponse(err);
        }
    }
);
