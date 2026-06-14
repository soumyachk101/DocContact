// Tiny client-side fetch wrapper — matches the API envelope of `ok()`
// (returns `{ data: { ... } }`) and `fail()` (returns `{ error: { ... } }`).

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

interface ApiOptions extends Omit<RequestInit, 'body'> {
    body?: unknown;
}

export async function api<T>(path: string, { body, headers, ...rest }: ApiOptions = {}): Promise<T> {
    const init: RequestInit = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            // CSRF defense: same-origin browsers already block cross-site
            // form posts for application/json content-types, but adding
            // a custom header guarantees a preflight on any cross-origin
            // request. If the request is cross-origin, the browser will
            // block it before our server sees it.
            'X-Requested-With': 'XMLHttpRequest',
            ...(headers || {}),
        },
        ...rest,
    };
    if (body !== undefined) {
        init.body = typeof body === 'string' ? body : JSON.stringify(body);
    }
    const res = await fetch(path, init);
    const text = await res.text();
    let parsed: unknown = null;
    if (text) {
        try {
            parsed = JSON.parse(text);
        } catch {
            parsed = text;
        }
    }
    if (!res.ok) {
        const message =
            parsed && typeof parsed === 'object' && 'error' in parsed
                ? extractErrorMessage((parsed as { error: unknown }).error) ?? res.statusText
                : res.statusText || `Request failed (${res.status})`;
        throw new ApiError(message, res.status);
    }
    return parsed as T;
}

function extractErrorMessage(error: unknown): string | null {
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error) {
        const m = (error as { message: unknown }).message;
        if (typeof m === 'string') return m;
    }
    return null;
}
