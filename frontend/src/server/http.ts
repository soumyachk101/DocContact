// Tiny HTTP helpers for route handlers — uniform JSON envelope and
// shared error mapping. Keeps each route file to 5–15 lines.

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class HttpError extends Error {
    constructor(
        public readonly status: number,
        message: string,
        public readonly code?: string
    ) {
        super(message);
        this.name = 'HttpError';
    }
}

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
    return NextResponse.json({ data }, init);
}

export function fail(status: number, message: string, code?: string): NextResponse {
    return NextResponse.json({ error: { message, code } }, { status });
}

export function errorToResponse(err: unknown): NextResponse {
    if (err instanceof HttpError) {
        return fail(err.status, err.message, err.code);
    }
    if (err instanceof ZodError) {
        const first = err.issues[0];
        const msg = first ? `${first.path.join('.') || 'body'}: ${first.message}` : 'Invalid input';
        return fail(400, msg, 'VALIDATION');
    }
    if (err && typeof err === 'object' && 'message' in err) {
        const message = String((err as { message: unknown }).message);
        // Common business errors from the booking flow.
        if (message.includes('full') || message.includes('not found')) {
            return fail(400, message, 'BUSINESS');
        }
        // eslint-disable-next-line no-console
        console.error('[route] unhandled error:', err);
        return fail(500, 'Internal server error', 'INTERNAL');
    }
    // eslint-disable-next-line no-console
    console.error('[route] non-object throw:', err);
    return fail(500, 'Internal server error', 'INTERNAL');
}
