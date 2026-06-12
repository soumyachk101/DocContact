import prisma from '../db/db.js';

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

export default {
    getAllDoctors,
    getDoctorById,
    insertDoctor,
    updateDoctorAfterBooking,
    advanceDoctorQueue,
    resetDoctorQueue,
    getAllActiveDoctors,
};
