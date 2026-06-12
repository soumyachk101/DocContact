// Zod schemas for doctor-related input (apply form + filters).

import { z } from 'zod';

export const treatments = ['Allopathy', 'Homoeopathy', 'Ayurvedic'] as const;
export const genders = ['male', 'female'] as const;

export const doctorApplySchema = z.object({
    fullName: z.string().trim().min(3).max(100),
    gender: z.enum(genders),
    treatment: z.enum(treatments),
    specialization: z.string().trim().min(2).max(100),
    degree: z.string().trim().min(2).max(100),
    experience: z.coerce.number().int().min(0).max(70),
    location: z.string().trim().min(5).max(250),
    city: z.string().trim().min(2).max(60),
    fees: z.coerce.number().int().min(0).max(100000),
    timings: z.string().trim().min(3).max(60),
    days: z.string().trim().min(2).max(60),
    maxTokens: z.coerce.number().int().min(1).max(200),
});

export const doctorListQuerySchema = z.object({
    treatment: z.enum(treatments).optional(),
    city: z.string().trim().min(1).max(60).optional(),
    search: z.string().trim().min(1).max(100).optional(),
    activeOnly: z
        .union([z.literal('1'), z.literal('true'), z.literal('false'), z.literal('0')])
        .optional()
        .transform((v) => v === '1' || v === 'true'),
    limit: z.coerce.number().int().min(1).max(50).optional(),
});

export type DoctorApplyInput = z.infer<typeof doctorApplySchema>;
export type DoctorListQuery = z.infer<typeof doctorListQuerySchema>;
