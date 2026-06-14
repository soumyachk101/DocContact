// Auth service — user creation and lookup, isolated from the route
// handlers so the same code can be used in API routes and (future)
// server actions.

import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/db';
import { HttpError } from '../http';
import type { SignupInput } from '../../schemas/user';

export interface AuthedUser {
    id: number;
    email: string;
    name: string;
    role: 'patient' | 'doctor';
    createdAt: string;
}

export async function createUser(input: SignupInput): Promise<AuthedUser> {
    // Defense-in-depth: even if the schema is ever loosened, never let a
    // caller self-assign a privileged role at signup. Doctors and admins
    // are provisioned through verified flows (apply / out-of-band).
    const role: 'patient' = 'patient';
    const existing = await prisma.user.findUnique({
        where: { email: input.email },
    });
    if (existing) {
        throw new HttpError(409, 'Email already registered.', 'EMAIL_TAKEN');
    }
    const passwordHash = bcrypt.hashSync(input.password, 12);
    const created = await prisma.user.create({
        data: {
            email: input.email,
            name: input.name,
            passwordHash,
            role,
        },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return toAuthedUser(created);
}

export async function findUserById(id: string | number): Promise<AuthedUser | null> {
    const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return user ? toAuthedUser(user) : null;
}

export async function findUserByEmailWithId(
    email: string
): Promise<{ id: number } | null> {
    // Narrow projection — never return the password hash, even to
    // server-side callers. Use this everywhere we only need the id.
    const user = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
        select: { id: true },
    });
    return user ? { id: user.id } : null;
}

// Kept for the credentials authorize() flow, which legitimately needs
// the hash to compare against the submitted password. Do NOT export
// this return shape to any API response or non-auth code path.
export async function findUserByEmailWithHash(
    email: string
): Promise<{ id: number; passwordHash: string; role: 'patient' | 'doctor' | 'admin' } | null> {
    const user = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
        select: { id: true, passwordHash: true, role: true },
    });
    return user
        ? {
              id: user.id,
              passwordHash: user.passwordHash,
              role: user.role as 'patient' | 'doctor' | 'admin',
          }
        : null;
}

export function verifyPassword(plain: string, hash: string): boolean {
    return bcrypt.compareSync(plain, hash);
}

function toAuthedUser(u: {
    id: number;
    email: string;
    name: string;
    role: string;
    createdAt: Date;
}): AuthedUser {
    return {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role as 'patient' | 'doctor',
        createdAt: u.createdAt.toISOString(),
    };
}
