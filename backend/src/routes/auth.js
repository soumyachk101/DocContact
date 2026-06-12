import express from 'express';
import { requireString, isValidEmail } from '../utils/validate.js';
import db from '../services/db.js';

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res, next) => {
    try {
        const { email, password, name, role } = req.body || {};
        const errors = [];

        if (!isValidEmail(email)) errors.push('A valid email is required.');
        if (requireString(password, 'Password', { minLength: 6, maxLength: 200 }) !== null) {
            errors.push('Password must be at least 6 characters.');
        }
        if (requireString(name, 'Full name', { minLength: 2, maxLength: 100 }) !== null) {
            errors.push('Full name is required.');
        }
        const finalRole = role === 'doctor' ? 'doctor' : 'patient';
        if (errors.length) {
            return res.status(400).json({ error: errors.join(' ') });
        }

        const existing = await db.findUserByEmail(email);
        if (existing) {
            return res.status(409).json({ error: 'Email already registered.' });
        }

        const user = await db.createUser({
            email: email.trim().toLowerCase(),
            password,
            name: name.trim(),
            role: finalRole,
        });
        req.session.userId = user.id;
        res.json({ user });
    } catch (err) {
        next(err);
    }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body || {};
        const passwordError = requireString(password, 'Password', { minLength: 1 });
        if (!isValidEmail(email) || passwordError !== null) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        const row = await db.findUserByEmail(email);
        if (!row || !db.verifyPassword(password, row.passwordHash)) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        req.session.userId = row.id;
        res.json({ user: { id: row.id, email: row.email, name: row.name, role: row.role } });
    } catch (err) {
        next(err);
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    if (!req.session) return res.json({ ok: true });
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: 'Could not log out.' });
        res.clearCookie('connect.sid');
        res.json({ ok: true });
    });
});

// GET /api/auth/me
router.get('/me', async (req, res, next) => {
    try {
        if (!req.session || !req.session.userId) return res.json({ user: null });
        const user = await db.findUserById(req.session.userId);
        res.json({ user: user || null });
    } catch (err) {
        next(err);
    }
});

export default router;
