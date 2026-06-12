// GET /api/doctors/active?limit=N
// Home-page feed of available doctors (not full).

import { ok, errorToResponse } from '@server/http';
import { listActiveDoctors } from '@server/doctors/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const limitRaw = url.searchParams.get('limit');
        const limit = limitRaw ? Math.max(1, Math.min(50, Number(limitRaw) || 4)) : 4;
        const doctors = await listActiveDoctors(limit);
        return ok({ doctors });
    } catch (err) {
        return errorToResponse(err);
    }
}
