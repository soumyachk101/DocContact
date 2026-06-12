import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';

// ------------------------------------------------------------------
// Doctors
// ------------------------------------------------------------------
async function getAllDoctors() {
    return prisma.doctor.findMany({ orderBy: { createdAt: 'asc' } });
}

async function getDoctorById(id) {
    return prisma.doctor.findUnique({ where: { id } });
}

async function insertDoctor(d) {
    return prisma.doctor.create({
        data: {
            ...d,
            available: Boolean(d.available),
        },
    });
}

async function updateDoctorAfterBooking(id) {
    await prisma.doctor.update({
        where: { id },
        data: { totalTokens: { increment: 1 } },
    });
}

async function advanceDoctorQueue(id) {
    return prisma.$transaction(async (tx) => {
        const doc = await tx.doctor.findUnique({ where: { id } });
        if (!doc || !doc.available || doc.currentToken >= doc.totalTokens) {
            return false;
        }
        await tx.doctor.update({
            where: { id },
            data: { currentToken: { increment: 1 } },
        });
        return true;
    });
}

async function resetDoctorQueue(id) {
    await prisma.doctor.update({ where: { id }, data: { currentToken: 0 } });
    return prisma.doctor.findUnique({ where: { id } });
}

async function getAllActiveDoctors() {
    return prisma.doctor.findMany({
        where: { available: true },
        orderBy: [{ currentToken: 'desc' }, { createdAt: 'asc' }],
    });
}

// ------------------------------------------------------------------
// Users
// ------------------------------------------------------------------
async function findUserByEmail(email) {
    return prisma.user.findUnique({ where: { email: String(email).trim().toLowerCase() } });
}

async function findUserById(id) {
    return prisma.user.findUnique({
        where: { id: Number(id) },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
}

async function createUser({ email, password, name, role }) {
    const passwordHash = bcrypt.hashSync(password, 10);
    const created = await prisma.user.create({
        data: {
            email: String(email).trim().toLowerCase(),
            passwordHash,
            name,
            role: role === 'doctor' ? 'doctor' : 'patient',
        },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return created;
}

function verifyPassword(plain, hash) {
    return bcrypt.compareSync(plain, hash);
}

// ------------------------------------------------------------------
// Bookings
// ------------------------------------------------------------------
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

export {
    getAllDoctors,
    getDoctorById,
    getAllActiveDoctors,
    insertDoctor,
    updateDoctorAfterBooking,
    advanceDoctorQueue,
    resetDoctorQueue,
    findUserByEmail,
    findUserById,
    createUser,
    verifyPassword,
    createBooking,
    getBookingsByUser,
    getBookingsForDoctor,
    bookAppointmentTransaction,
};

export default {
    prisma,
    getAllDoctors,
    getDoctorById,
    getAllActiveDoctors,
    insertDoctor,
    updateDoctorAfterBooking,
    advanceDoctorQueue,
    resetDoctorQueue,
    findUserByEmail,
    findUserById,
    createUser,
    verifyPassword,
    createBooking,
    getBookingsByUser,
    getBookingsForDoctor,
    bookAppointmentTransaction,
};
