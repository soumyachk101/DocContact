// GET /api/doctors/:id

import { ok, errorToResponse } from '@server/http';
import { getDoctor } from '@server/doctors/service';

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
