// GET /api/clinics/me — fetch profile of logged-in clinic

import { ok, errorToResponse, fail } from '@server/http';
import { withRole } from '@server/withAuth';
import { getClinicByUserId } from '@server/clinics/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withRole('clinic')(async (_req, { user }) => {
    try {
        const clinic = await getClinicByUserId(Number(user.id));
        if (!clinic) {
            return fail(404, 'Clinic profile not found. Please apply first.', 'NOT_FOUND');
        }
        return ok({ clinic });
    } catch (err) {
        return errorToResponse(err);
    }
});
