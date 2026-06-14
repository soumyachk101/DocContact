// Doctor service — list / read / apply / advance / reset.
// All DB access goes through here so route handlers stay thin.

import { prisma } from '../../lib/db';
import { HttpError } from '../http';
import type { DoctorApplyInput, DoctorListQuery } from '../../schemas/doctor';

export interface DoctorRow {
    id: string;
    userId: number | null;
    fullName: string;
    gender: 'male' | 'female';
    treatment: 'Allopathy' | 'Homoeopathy' | 'Ayurvedic';
    specialization: string;
    degree: string;
    experience: number;
    location: string;
    city: string;
    fees: number;
    timings: string;
    days: string;
    available: boolean;
    currentToken: number;
    totalTokens: number;
    maxTokens: number;
    createdAt: string;
}

export function toDoctor(d: {
    id: string;
    userId: number | null;
    fullName: string;
    gender: 'male' | 'female';
    treatment: 'Allopathy' | 'Homoeopathy' | 'Ayurvedic';
    specialization: string;
    degree: string;
    experience: number;
    location: string;
    city: string;
    fees: number;
    timings: string;
    days: string;
    available: boolean;
    currentToken: number;
    totalTokens: number;
    maxTokens: number;
    createdAt: Date;
}): DoctorRow {
    return {
        id: d.id,
        userId: d.userId,
        fullName: d.fullName,
        gender: d.gender,
        treatment: d.treatment,
        specialization: d.specialization,
        degree: d.degree,
        experience: d.experience,
        location: d.location,
        city: d.city,
        fees: d.fees,
        timings: d.timings,
        days: d.days,
        available: d.available,
        currentToken: d.currentToken,
        totalTokens: d.totalTokens,
        maxTokens: d.maxTokens,
        createdAt: d.createdAt.toISOString(),
    };
}

export async function listDoctors(query: DoctorListQuery): Promise<DoctorRow[]> {
    const where: {
        treatment?: 'Allopathy' | 'Homoeopathy' | 'Ayurvedic';
        city?: string;
        available?: boolean;
        isVerified?: boolean;
    } = {
        isVerified: true
    };
    if (query.treatment) where.treatment = query.treatment;
    if (query.city) where.city = query.city;
    if (query.activeOnly) where.available = true;

    let doctors = await prisma.doctor.findMany({
        where,
        orderBy: { createdAt: 'asc' },
    });

    if (query.search) {
        const q = query.search.toLowerCase();
        doctors = doctors.filter(
            (d) =>
                d.fullName.toLowerCase().includes(q) ||
                d.degree.toLowerCase().includes(q) ||
                d.specialization.toLowerCase().includes(q) ||
                d.location.toLowerCase().includes(q)
        );
    }

    return doctors.map(toDoctor);
}

export async function listActiveDoctors(limit?: number): Promise<DoctorRow[]> {
    const doctors = await prisma.doctor.findMany({
        where: { available: true, isVerified: true },
        orderBy: [{ currentToken: 'desc' }, { createdAt: 'asc' }],
    });
    const slice = typeof limit === 'number' ? doctors.slice(0, limit) : doctors;
    return slice.map(toDoctor);
}

export async function getDoctor(id: string): Promise<DoctorRow> {
    const doc = await prisma.doctor.findUnique({ where: { id } });
    if (!doc) {
        throw new HttpError(404, 'Doctor not found.', 'NOT_FOUND');
    }
    return toDoctor(doc);
}

export async function applyAsDoctor(userId: number, input: DoctorApplyInput): Promise<DoctorRow> {
    const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    let fullName = input.fullName;
    if (!/^dr\.?/i.test(fullName)) {
        fullName = `Dr. ${fullName}`;
    }
    const created = await prisma.$transaction(async (tx) => {
        // Enforce uniqueness: a user can only have one doctor profile.
        // Without this, a second apply would create a duplicate profile
        // (the @@unique on Doctor.userId would throw, but not until
        // after a leaked doctor row is visible).
        const existing = await tx.doctor.findUnique({ where: { userId } });
        if (existing) {
            const err = new Error('You already have a doctor profile.');
            (err as { status?: number; code?: string }).status = 409;
            (err as { status?: number; code?: string }).code = 'DUPLICATE';
            throw err;
        }
        const doc = await tx.doctor.create({
            data: {
                id,
                userId,
                fullName,
                gender: input.gender,
                treatment: input.treatment,
                specialization: input.specialization,
                degree: input.degree,
                experience: input.experience,
                location: input.location,
                city: input.city,
                fees: input.fees,
                timings: input.timings,
                days: input.days,
                available: true,
                currentToken: 0,
                totalTokens: 0,
                maxTokens: input.maxTokens,
            },
        });
        // Only promote to 'doctor' if the caller is currently a 'patient'.
        // Never demote a 'doctor' or 'admin' here — and never write a
        // role coming from the client (we already strip role from the
        // signup path; this guards the apply-promotion path too).
        const dbUser = await tx.user.findUnique({ where: { id: userId }, select: { role: true } });
        if (dbUser && dbUser.role === 'patient') {
            await tx.user.update({
                where: { id: userId },
                data: { role: 'doctor' },
            });
        }
        return doc;
    });
    return toDoctor(created);
}

export async function advanceQueue(id: string): Promise<DoctorRow> {
    const ok = await prisma.$transaction(async (tx) => {
        const doc = await tx.doctor.findUnique({ where: { id } });
        if (!doc || !doc.available) return false;
        if (doc.currentToken >= doc.totalTokens) return false;
        await tx.doctor.update({
            where: { id },
            data: { currentToken: { increment: 1 } },
        });
        return true;
    });
    if (!ok) {
        throw new HttpError(
            400,
            'Queue cannot be advanced (already finished or doctor unavailable).',
            'BUSINESS'
        );
    }
    const updated = await prisma.doctor.findUnique({ where: { id } });
    if (!updated) {
        throw new HttpError(404, 'Doctor not found.', 'NOT_FOUND');
    }
    return toDoctor(updated);
}

export async function resetQueue(id: string): Promise<DoctorRow> {
    await prisma.doctor.update({ where: { id }, data: { currentToken: 0 } });
    const updated = await prisma.doctor.findUnique({ where: { id } });
    if (!updated) {
        throw new HttpError(404, 'Doctor not found.', 'NOT_FOUND');
    }
    return toDoctor(updated);
}

export async function updateDoctorSettings(
    id: string,
    data: {
        available?: boolean;
        maxTokens?: number;
        fees?: number;
        timings?: string;
        days?: string;
    }
): Promise<DoctorRow> {
    // Hard-cap the fields that can be updated from non-admin / owner
    // surfaces, so a future caller can't smuggle isVerified, fullName,
    // or other columns through this entry point. If a new editable
    // field is added, add it to the allowlist above AND here.
    const allowedKeys = ['available', 'maxTokens', 'fees', 'timings', 'days'] as const;
    const safe: Record<string, unknown> = {};
    for (const key of allowedKeys) {
        if (key in data) safe[key] = (data as Record<string, unknown>)[key];
    }
    const updated = await prisma.doctor.update({
        where: { id },
        data: safe,
    });
    return toDoctor(updated);
}

export async function listAllDoctorsAdmin(): Promise<DoctorRow[]> {
    const doctors = await prisma.doctor.findMany({
        orderBy: { createdAt: 'desc' },
    });
    return doctors.map(toDoctor);
}

export async function verifyDoctor(id: string, isVerified: boolean): Promise<DoctorRow> {
    const updated = await prisma.doctor.update({
        where: { id },
        data: { isVerified },
    });
    return toDoctor(updated);
}

export async function deleteDoctorProfile(id: string): Promise<boolean> {
    await prisma.doctor.delete({
        where: { id },
    });
    return true;
}
