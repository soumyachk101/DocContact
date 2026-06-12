import bcrypt from 'bcryptjs';
import prisma from '../db/db.js';

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
    return prisma.user.create({
        data: {
            email: String(email).trim().toLowerCase(),
            passwordHash,
            name,
            role: role === 'doctor' ? 'doctor' : 'patient',
        },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
}

function verifyPassword(plain, hash) {
    return bcrypt.compareSync(plain, hash);
}

export default {
    findUserByEmail,
    findUserById,
    createUser,
    verifyPassword,
};
