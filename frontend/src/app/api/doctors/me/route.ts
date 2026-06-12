import { ok, errorToResponse, fail } from '@server/http';
import { withRole } from '@server/withAuth';
import { prisma } from '@/lib/db';
import { toDoctor } from '@server/doctors/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withRole('doctor')(async (_req, { user }) => {
    try {
        const doc = await prisma.doctor.findUnique({
            where: { userId: Number(user.id) }
        });
        if (!doc) {
            return fail(404, 'Doctor profile not found. Please apply first.', 'NOT_FOUND');
        }
        return ok({ doctor: toDoctor(doc) });
    } catch (err) {
        return errorToResponse(err);
    }
});
