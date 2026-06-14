import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Prisma + bcryptjs are native modules that must stay on the Node server,
  // never bundled into the edge runtime.
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'bcryptjs'],

  async headers() {
    // Defense-in-depth response headers. The frontend is public, so
    // we explicitly deny framing and restrict what the browser is
    // allowed to load. Next.js already sets X-Content-Type-Options
    // and Referrer-Policy in production; this list is additive.
    const csp = [
        "default-src 'self'",
        // Inline styles: required by Next.js hydration + Tailwind reset.
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data:",
        // Scripts: Next.js emits a small inline boot script in dev and
        // nonce-stamped scripts in prod. 'self' is enough; we do not
        // need 'unsafe-inline' or 'unsafe-eval' on the deployed app.
        "script-src 'self'",
        // Connect: own origin + the deployed backend API. The backend
        // hostname is provided via NEXT_PUBLIC_API_BASE_URL at build
        // time so it can be tightened per-environment.
        `connect-src 'self' ${process.env.NEXT_PUBLIC_API_BASE_URL ?? ''}`.trim(),
        "frame-ancestors 'none'",
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
    ].join('; ');

    return [
      {
        // Apply to every route, including API and static assets.
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
