// Booking service — create (with the queue-full CAS) + list by user.

import { prisma } from '../../lib/db';
import type { CreateBookingInput } from '../../schemas/booking';
import type { DoctorRow } from '../doctors/service';
import { toDoctor } from '../doctors/service';

export interface BookingRow {
    id: string;
    userId: number;
    doctorId: string;
    doctorName: string;
    doctorSpecialization: string;
    doctorLocation: string;
    doctorCity: string;
    bookingDate: string;
    timeSlot: string;
    patientName: string;
    patientPhone: string;
    patientAge: string;
    patientGender: string;
    tokenNumber: number;
    bookedAt: string;
    doctor: DoctorRow | null;
}

function toBooking(b: {
    id: string;
    userId: number;
    doctorId: string;
    doctorName: string;
    doctorSpecialization: string;
    doctorLocation: string;
    doctorCity: string;
    bookingDate: string;
    timeSlot: string;
    patientName: string;
    patientPhone: string;
    patientAge: string;
    patientGender: string;
    tokenNumber: number;
    bookedAt: Date;
    doctor?: unknown;
}): BookingRow {
    return {
        id: b.id,
        userId: b.userId,
        doctorId: b.doctorId,
        doctorName: b.doctorName,
        doctorSpecialization: b.doctorSpecialization,
        doctorLocation: b.doctorLocation,
        doctorCity: b.doctorCity,
        bookingDate: b.bookingDate,
        timeSlot: b.timeSlot,
        patientName: b.patientName,
        patientPhone: b.patientPhone,
        patientAge: b.patientAge,
        patientGender: b.patientGender,
        tokenNumber: b.tokenNumber,
        bookedAt: b.bookedAt.toISOString(),
        doctor: b.doctor ? toDoctor(b.doctor as Parameters<typeof toDoctor>[0]) : null,
    };
}

export async function createBooking(userId: number, input: CreateBookingInput): Promise<BookingRow> {
    const bookingId = `bk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const booking = await prisma.$transaction(async (tx) => {
        const doc = await tx.doctor.findUnique({ where: { id: input.doctorId } });
        if (!doc) {
            const err = new Error('Doctor not found');
            (err as { status?: number }).status = 404;
            throw err;
        }
        if (doc.totalTokens >= doc.maxTokens) {
            throw new Error('Doctor chamber queue is full for today!');
        }
        const updated = await tx.doctor.updateMany({
            where: { id: input.doctorId, totalTokens: { lt: doc.maxTokens } },
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
                doctorId: doc.id,
                doctorName: doc.fullName,
                doctorSpecialization: doc.specialization,
                doctorLocation: doc.location,
                doctorCity: doc.city,
                bookingDate: input.bookingDate,
                timeSlot: input.timeSlot,
                patientName: input.patientName,
                patientPhone: input.patientPhone,
                patientAge: input.patientAge,
                patientGender: input.patientGender,
                tokenNumber: newToken,
            },
        });
    });

    return toBooking(booking);
}

export async function listBookingsForUser(userId: number): Promise<BookingRow[]> {
    const rows = await prisma.booking.findMany({
        where: { userId },
        orderBy: { bookedAt: 'desc' },
        include: { doctor: true },
    });
    return rows.map(toBooking);
}

export async function cancelBooking(userId: number, bookingId: string, role: string): Promise<boolean> {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { doctor: true }
    });
    if (!booking) {
        throw new Error('Booking not found');
    }
    const isOwner = booking.userId === userId;
    const isAdmin = role === 'admin';
    const isDoctorOfBooking = role === 'doctor' && booking.doctor?.userId === userId;

    if (!isOwner && !isAdmin && !isDoctorOfBooking) {
        throw new Error('Unauthorized to cancel this booking.');
    }

    await prisma.$transaction(async (tx) => {
        const doc = await tx.doctor.findUnique({ where: { id: booking.doctorId } });
        if (doc && doc.totalTokens === booking.tokenNumber) {
            await tx.doctor.update({
                where: { id: booking.doctorId },
                data: { totalTokens: { decrement: 1 } }
            });
        }
        await tx.booking.delete({
            where: { id: bookingId }
        });
    });

    return true;
}

export async function listBookingsForDoctor(doctorId: string): Promise<BookingRow[]> {
    const rows = await prisma.booking.findMany({
        where: { doctorId },
        orderBy: { tokenNumber: 'asc' },
        include: { doctor: true },
    });
    return rows.map(toBooking);
}
