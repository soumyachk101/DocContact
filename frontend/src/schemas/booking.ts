// Zod schemas for booking creation.

import { z } from 'zod';

export const patientGenders = ['Male', 'Female', 'Other'] as const;

export const createBookingSchema = z.object({
    doctorId: z.string().min(1, 'Doctor is required.').max(60),
    bookingDate: z.string().min(1, 'Booking date is required.'),
    timeSlot: z.string().min(1, 'Time slot is required.'),
    patientName: z.string().trim().min(2).max(100),
    patientPhone: z
        .string()
        .trim()
        .regex(/^\d{10}$/, 'A 10-digit phone number is required.'),
    patientAge: z
        .string()
        .trim()
        .min(1, 'Patient age is required.')
        .max(10)
        .refine((s) => {
            const n = Number(s);
            return Number.isFinite(n) && n >= 0 && n <= 120;
        }, 'Age must be between 0 and 120.'),
    patientGender: z.enum(patientGenders),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
