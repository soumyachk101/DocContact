import userModel from '../models/user.js';
import { requireString, isValidEmail } from '../validation/validate.js';

export async function signup(req, res, next) {
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

        const existing = await userModel.findUserByEmail(email);
        if (existing) {
            return res.status(409).json({ error: 'Email already registered.' });
        }

        const user = await userModel.createUser({
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
}

export async function login(req, res, next) {
    try {
        const { email, password } = req.body || {};
        const passwordError = requireString(password, 'Password', { minLength: 1 });
        if (!isValidEmail(email) || passwordError !== null) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        const row = await userModel.findUserByEmail(email);
        if (!row || !userModel.verifyPassword(password, row.passwordHash)) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        req.session.userId = row.id;
        res.json({ user: { id: row.id, email: row.email, name: row.name, role: row.role } });
    } catch (err) {
        next(err);
    }
}

export function logout(req, res) {
    if (!req.session) return res.json({ ok: true });
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: 'Could not log out.' });
        res.clearCookie('connect.sid');
        res.json({ ok: true });
    });
}

export async function me(req, res, next) {
    try {
        if (!req.session || !req.session.userId) return res.json({ user: null });
        const user = await userModel.findUserById(req.session.userId);
        res.json({ user: user || null });
    } catch (err) {
        next(err);
    }
}
