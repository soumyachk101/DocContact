import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import requestLogger from './middleware/logger.js';
import errorHandler from './middleware/errorHandler.js';
import routes from './routers/index.js';

const app = express();

// In production, refuse to boot without a real SESSION_SECRET. The
// fallback below is a known dev string that would silently accept
// forged cookies if it ever reached a deployed environment.
if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
    // eslint-disable-next-line no-console
    console.error('FATAL: SESSION_SECRET is not set in production.');
    process.exit(1);
}

app.set('trust proxy', 1);

// Security headers — defense-in-depth. Helmet is omitted from the
// dependency list to keep the bundle small; the same set is applied
// explicitly so the policy is reviewable in this file.
app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
});

// CORS — the backend is consumed by the deployed frontend only. We
// reflect the request's Origin only when it matches an allowlist read
// from ALLOWED_ORIGINS (comma-separated). When unset, the backend
// behaves as a same-origin service (no Access-Control-Allow-Origin
// is sent, so browsers reject cross-origin reads).
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: false, limit: '64kb' }));
app.use(cookieParser());

app.use(
    session({
        name: 'connect.sid',
        secret: process.env.SESSION_SECRET || 'zen-doctor-dev-secret-change-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production', // HTTPS-only in prod
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        },
    })
);

// Request Logger middleware
app.use(requestLogger);

// Mount main routes router on /api
app.use('/api', routes);

// Health check
app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// Centralized error handler
app.use(errorHandler);

export default app;
