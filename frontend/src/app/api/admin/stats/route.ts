import { ok, errorToResponse } from '@server/http';
import { withRole } from '@server/withAuth';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withRole('admin')(async () => {
    try {
        const [patientsCount, doctorsCount, bookingsCount, activeChambersCount] = await Promise.all([
            prisma.user.count({ where: { role: 'patient' } }),
            prisma.doctor.count(),
            prisma.booking.count(),
            prisma.doctor.count({ where: { available: true, isVerified: true } }),
        ]);

        return ok({
            stats: {
                totalPatients: patientsCount,
                totalDoctors: doctorsCount,
                totalBookings: bookingsCount,
                activeChambers: activeChambersCount,
            },
        });
    } catch (err) {
        return errorToResponse(err);
    }
});
