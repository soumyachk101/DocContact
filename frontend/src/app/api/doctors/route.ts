// GET  /api/doctors       — list + filter (treatment, city, search, activeOnly)
// POST /api/doctors       — apply (auth + role=doctor)

import { ok, errorToResponse } from '@server/http';
import { withAuth } from '@server/withAuth';
import { listDoctors, applyAsDoctor } from '@server/doctors/service';
import { doctorApplySchema, doctorListQuerySchema } from '@schemas/doctor';
import { findUserByEmailWithId } from '@server/auth/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const raw: Record<string, string> = {};
        url.searchParams.forEach((v, k) => {
            raw[k] = v;
        });
        const parsed = doctorListQuerySchema.safeParse(raw);
        if (!parsed.success) {
            const { NextResponse } = await import('next/server');
            return NextResponse.json({ error: { message: 'Invalid query.' } }, { status: 400 });
        }
        const doctors = await listDoctors(parsed.data);
        return ok({ doctors });
    } catch (err) {
        return errorToResponse(err);
    }
}

export const POST = withAuth(async (req, { user }) => {
    try {
        // Apply is a write that promotes the caller to role='doctor' and
        // publishes a public profile. Only callers who do not already
        // hold a privileged role may apply — otherwise an admin could
        // self-apply and then have the apply transaction reset their
        // role to 'doctor' (and unlock cross-doctor doctor endpoints).
        // Patient-apply-only: blocked if caller is already 'admin'.
        if (user.role === 'admin') {
            return ok({ error: { message: 'Admins cannot apply as doctors.', code: 'FORBIDDEN' } }, { status: 403 });
        }
        const body = await req.json().catch(() => ({}));
        const parsed = doctorApplySchema.safeParse(body);
        if (!parsed.success) {
            return new Response(
                JSON.stringify({ error: { message: parsed.error.issues[0]?.message ?? 'Invalid input.' } }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            ) as unknown as import('next/server').NextResponse;
        }
        // Find the underlying user id; `user.id` is the string form.
        const dbUser = await findUserByEmailWithId(user.email ?? '');
        const userId = dbUser?.id ?? Number(user.id);
        const doctor = await applyAsDoctor(userId, parsed.data);
        return ok({ doctor });
    } catch (err) {
        return errorToResponse(err);
    }
});
