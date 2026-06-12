import prisma from '../db/db.js';

async function createBooking(b) {
    return prisma.booking.create({ data: b });
}

async function getBookingsByUser(userId) {
    return prisma.booking.findMany({
        where: { userId: Number(userId) },
        orderBy: { bookedAt: 'desc' },
        include: { doctor: true },
    });
}

async function getBookingsForDoctor(doctorId) {
    return prisma.booking.findMany({
        where: { doctorId },
        orderBy: { tokenNumber: 'asc' },
    });
}

async function bookAppointmentTransaction({
    bookingId,
    userId,
    doctorId,
    patientName,
    patientPhone,
    patientAge,
    patientGender,
    bookingDate,
    timeSlot,
}) {
    return prisma.$transaction(async (tx) => {
        const doc = await tx.doctor.findUnique({ where: { id: doctorId } });
        if (!doc) throw new Error('Doctor not found');
        if (doc.totalTokens >= doc.maxTokens) {
            throw new Error('Doctor chamber queue is full for today!');
        }

        const updated = await tx.doctor.updateMany({
            where: { id: doctorId, totalTokens: { lt: doc.maxTokens } },
            data: { totalTokens: { increment: 1 } },
        });
        if (updated.count === 0) {
            throw new Error('Doctor chamber queue is full for today!');
        }

        const newToken = doc.totalTokens + 1;
        return tx.booking.create({
            data: {
                id: bookingId,
                userId,
                doctorId,
                doctorName: doc.fullName,
                doctorSpecialization: doc.specialization,
                doctorLocation: doc.location,
                doctorCity: doc.city,
                bookingDate,
                timeSlot,
                patientName,
                patientPhone,
                patientAge,
                patientGender,
                tokenNumber: newToken,
            },
        });
    });
}

export default {
    createBooking,
    getBookingsByUser,
    getBookingsForDoctor,
    bookAppointmentTransaction,
};
