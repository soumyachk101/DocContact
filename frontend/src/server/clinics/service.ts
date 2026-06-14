// Clinic service — apply, lookup, get profile.

import { prisma } from '../../lib/db';
import type { ClinicApplyInput } from '../../schemas/clinic';
import type { Clinic } from '../../types/api';

export async function applyAsClinic(userId: number, input: ClinicApplyInput): Promise<Clinic> {
    const id = `clinic_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    
    const created = await prisma.$transaction(async (tx) => {
        // Enforce uniqueness: a user can only have one clinic profile.
        const existing = await tx.clinic.findUnique({ where: { userId } });
        if (existing) {
            const err = new Error('You already have a clinic profile.');
            (err as { status?: number; code?: string }).status = 409;
            (err as { status?: number; code?: string }).code = 'DUPLICATE';
            throw err;
        }
        
        const clinic = await tx.clinic.create({
            data: {
                id,
                userId,
                name: input.name,
                location: input.location,
                city: input.city,
                phone: input.phone,
                timings: input.timings,
            },
        });
        
        // Promote role to 'clinic'
        const dbUser = await tx.user.findUnique({ where: { id: userId }, select: { role: true } });
        if (dbUser && dbUser.role === 'patient') {
            await tx.user.update({
                where: { id: userId },
                data: { role: 'clinic' },
            });
        }
        
        return clinic;
    });

    return {
        id: created.id,
        userId: created.userId,
        name: created.name,
        location: created.location,
        city: created.city,
        phone: created.phone,
        timings: created.timings,
        createdAt: created.createdAt.toISOString(),
    };
}

export async function getClinicByUserId(userId: number): Promise<Clinic | null> {
    const clinic = await prisma.clinic.findUnique({
        where: { userId },
        include: {
            doctors: {
                orderBy: { createdAt: 'asc' }
            },
        },
    });
    if (!clinic) return null;
    return {
        id: clinic.id,
        userId: clinic.userId,
        name: clinic.name,
        location: clinic.location,
        city: clinic.city,
        phone: clinic.phone,
        timings: clinic.timings,
        createdAt: clinic.createdAt.toISOString(),
        doctors: clinic.doctors.map((d) => ({
            ...d,
            createdAt: d.createdAt.toISOString(),
        })),
    };
}

import type { DoctorApplyInput } from '../../schemas/doctor';
import { toDoctor, type DoctorRow } from '../doctors/service';

export async function createDoctorUnderClinic(clinicId: string, input: DoctorApplyInput): Promise<DoctorRow> {
    const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    let fullName = input.fullName;
    if (!/^dr\.?/i.test(fullName)) {
        fullName = `Dr. ${fullName}`;
    }
    const doc = await prisma.doctor.create({
        data: {
            id,
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
            clinicId,
        },
    });
    return toDoctor(doc);
}
