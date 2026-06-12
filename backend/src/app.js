import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import requestLogger from './middleware/logger.js';
import errorHandler from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

app.set('trust proxy', 1);

app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: false }));
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
            secure: false, // set true behind HTTPS
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
