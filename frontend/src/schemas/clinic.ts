// Zod schemas for clinic-related input (apply form).

import { z } from 'zod';

export const clinicApplySchema = z.object({
    name: z.string().trim().min(3, 'Clinic name must be at least 3 characters.').max(100),
    location: z.string().trim().min(5, 'Address must be at least 5 characters.').max(250),
    city: z.string().trim().min(2, 'City is required.').max(60),
    phone: z.string().trim().min(10, 'Contact number must be at least 10 digits.').max(15),
    timings: z.string().trim().min(3, 'Clinic timings are required.').max(60),
});

export type ClinicApplyInput = z.infer<typeof clinicApplySchema>;
