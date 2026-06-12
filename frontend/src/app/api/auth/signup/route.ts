// POST /api/auth/signup
// Creates a new user, then signs them in so a session cookie is set in
// the same response.

import { signIn } from '@lib/auth';
import { ok, fail, errorToResponse } from '@server/http';
import { createUser } from '@server/auth/service';
import { signupSchema } from '@schemas/user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const parsed = signupSchema.safeParse(body);
        if (!parsed.success) {
            return fail(400, parsed.error.issues[0]?.message ?? 'Invalid input.', 'VALIDATION');
        }
        const user = await createUser(parsed.data);
        // Best-effort: sign in the new user. If this fails (e.g. cookie
        // domain misconfig), the user is still created and the client
        // can fall back to /login.
        try {
            await signIn('credentials', {
                email: user.email,
                password: parsed.data.password,
                redirect: false,
            });
        } catch {
            // ignore — signup itself succeeded
        }
        return ok({ user });
    } catch (err) {
        return errorToResponse(err);
    }
}
