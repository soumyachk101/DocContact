// Higher-order wrappers for App Router route handlers. App Router
// has no Express-style middleware chain, so we wrap a handler with
// `withAuth` / `withRole` and the wrapper verifies the session before
// invoking the inner function. Throws HttpError → caught by route
// handler's `try/catch` → mapped to a JSON response by `errorToResponse`.

import { NextResponse } from 'next/server';
import { auth } from '../lib/auth';
import { HttpError, errorToResponse } from './http';

type Handler<Ctx = unknown> = (
    req: Request,
    ctx: Ctx & { user: { id: string; role: 'patient' | 'doctor' | 'admin'; email?: string | null; name?: string | null } }
) => Promise<NextResponse> | NextResponse;

type CtxOnlyHandler<Ctx = unknown> = (req: Request, ctx: Ctx) => Promise<NextResponse> | NextResponse;

export function withAuth<Ctx = unknown>(handler: Handler<Ctx>): CtxOnlyHandler<Ctx> {
    return async (req, ctx) => {
        try {
            const session = await auth();
            if (!session?.user?.id) {
                throw new HttpError(401, 'Authentication required.', 'UNAUTHENTICATED');
            }
            return await handler(req, {
                ...(ctx as Ctx),
                user: {
                    id: session.user.id,
                    role: session.user.role,
                    email: session.user.email ?? null,
                    name: session.user.name ?? null,
                },
            });
        } catch (err) {
            return errorToResponse(err);
        }
    };
}

export function withRole<Ctx = unknown>(role: 'patient' | 'doctor' | 'admin') {
    return (handler: Handler<Ctx>): CtxOnlyHandler<Ctx> =>
        withAuth<Ctx>(async (req, ctx) => {
            if (ctx.user.role !== role) {
                throw new HttpError(403, `This action requires a ${role} account.`, 'FORBIDDEN');
            }
            return handler(req, ctx);
        });
}
