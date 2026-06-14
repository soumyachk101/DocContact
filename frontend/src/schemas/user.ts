// Zod schemas for user input validation. These are the single source
// of truth — both the API route handlers and any client-side form
// checks import from here.

import { z } from 'zod';

export const signupSchema = z.object({
    name: z.string().trim().min(2, 'Full name is required.').max(100),
    email: z.string().trim().toLowerCase().email('A valid email is required.'),
    password: z.string().min(8, 'Password must be at least 8 characters.').max(200),
    // Role is server-assigned (defaults to 'patient'). Self-selection of
    // 'doctor' or 'admin' at signup would let any unauthenticated caller
    // create privileged accounts, so the field is intentionally not
    // accepted from the client. Doctors are created via the verified
    // apply flow, admins are provisioned out-of-band.
    role: z.enum(['patient']).default('patient').optional(),
});

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email('A valid email is required.'),
    password: z.string().min(1, 'Password is required.'),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
