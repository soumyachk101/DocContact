import { ok, errorToResponse } from '@server/http';
import { withRole } from '@server/withAuth';
import { listAllDoctorsAdmin } from '@server/doctors/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withRole('admin')(async () => {
    try {
        const doctors = await listAllDoctorsAdmin();
        return ok({ doctors });
    } catch (err) {
        return errorToResponse(err);
    }
});
