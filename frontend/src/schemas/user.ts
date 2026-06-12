// Zod schemas for user input validation. These are the single source
// of truth — both the API route handlers and any client-side form
// checks import from here.

import { z } from 'zod';

export const signupSchema = z.object({
    name: z.string().trim().min(2, 'Full name is required.').max(100),
    email: z.string().trim().toLowerCase().email('A valid email is required.'),
    password: z.string().min(6, 'Password must be at least 6 characters.').max(200),
    role: z.enum(['patient', 'doctor', 'admin']).default('patient'),
});

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email('A valid email is required.'),
    password: z.string().min(1, 'Password is required.'),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
