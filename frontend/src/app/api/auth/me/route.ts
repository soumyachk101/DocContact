// GET /api/auth/me
// Returns the current session user (null if not authenticated).

import { ok, errorToResponse } from '@server/http';
import { findUserById } from '@server/auth/service';
import { auth } from '@lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) return ok({ user: null });
        const user = await findUserById(session.user.id);
        return ok({ user: user ?? null });
    } catch (err) {
        return errorToResponse(err);
    }
}
