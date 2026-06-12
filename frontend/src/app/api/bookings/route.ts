// GET  /api/bookings — list current user's bookings (with live doctor data)
// POST /api/bookings — create a booking for the current user

import { ok, fail, errorToResponse } from '@server/http';
import { withAuth } from '@server/withAuth';
import { createBooking, listBookingsForUser } from '@server/bookings/service';
import { createBookingSchema } from '@schemas/booking';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAuth(async (_req, { user }) => {
    try {
        const bookings = await listBookingsForUser(Number(user.id));
        return ok({ bookings });
    } catch (err) {
        return errorToResponse(err);
    }
});

export const POST = withAuth(async (req, { user }) => {
    try {
        const body = await req.json().catch(() => ({}));
        const parsed = createBookingSchema.safeParse(body);
        if (!parsed.success) {
            return fail(400, parsed.error.issues[0]?.message ?? 'Invalid input.', 'VALIDATION');
        }
        const booking = await createBooking(Number(user.id), parsed.data);
        return ok({ booking });
    } catch (err) {
        return errorToResponse(err);
    }
});
