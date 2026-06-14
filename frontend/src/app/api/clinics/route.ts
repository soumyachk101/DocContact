// POST /api/clinics — apply (auth + role=clinic onboarding)

import { ok, errorToResponse } from '@server/http';
import { withAuth } from '@server/withAuth';
import { applyAsClinic } from '@server/clinics/service';
import { clinicApplySchema } from '@schemas/clinic';
import { findUserByEmailWithId } from '@server/auth/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withAuth(async (req, { user }) => {
    try {
        if (user.role === 'admin') {
            return ok({ error: { message: 'Admins cannot apply as clinics.', code: 'FORBIDDEN' } }, { status: 403 });
        }
        const body = await req.json().catch(() => ({}));
        const parsed = clinicApplySchema.safeParse(body);
        if (!parsed.success) {
            return new Response(
                JSON.stringify({ error: { message: parsed.error.issues[0]?.message ?? 'Invalid input.' } }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            ) as unknown as import('next/server').NextResponse;
        }
        const dbUser = await findUserByEmailWithId(user.email ?? '');
        const userId = dbUser?.id ?? Number(user.id);
        const clinic = await applyAsClinic(userId, parsed.data);
        return ok({ clinic });
    } catch (err) {
        return errorToResponse(err);
    }
});
