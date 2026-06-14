// POST /api/clinics/doctors — allow clinics to create doctor chambers

import { ok, errorToResponse, fail } from '@server/http';
import { withRole } from '@server/withAuth';
import { getClinicByUserId, createDoctorUnderClinic } from '@server/clinics/service';
import { doctorApplySchema } from '@schemas/doctor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withRole('clinic')(async (req, { user }) => {
    try {
        const clinic = await getClinicByUserId(Number(user.id));
        if (!clinic) {
            return fail(404, 'Clinic profile not found. Please apply first.', 'NOT_FOUND');
        }
        const body = await req.json().catch(() => ({}));
        const parsed = doctorApplySchema.safeParse(body);
        if (!parsed.success) {
            return new Response(
                JSON.stringify({ error: { message: parsed.error.issues[0]?.message ?? 'Invalid input.' } }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            ) as unknown as import('next/server').NextResponse;
        }
        const doctor = await createDoctorUnderClinic(clinic.id, parsed.data);
        return ok({ doctor });
    } catch (err) {
        return errorToResponse(err);
    }
});
