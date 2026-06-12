'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
    const router = useRouter();
    useEffect(() => {
        // Soft client-side redirect — keeps the URL valid for SSR.
        const t = setTimeout(() => router.replace('/'), 1500);
        return () => clearTimeout(t);
    }, [router]);
    return (
        <div className="container fade-in" style={{ padding: '3rem 0', textAlign: 'center' }}>
            <h1 className="text-2xl">Page not found</h1>
            <p className="text-muted">Redirecting to the home page…</p>
        </div>
    );
}
