import express from 'express';
import { requireString, parseIntInRange } from '../utils/validate.js';
import db from '../services/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/doctors
router.get('/', async (req, res, next) => {
    try {
        const { treatment, city, search, activeOnly } = req.query;
        let doctors = await db.getAllDoctors();

        if (treatment) doctors = doctors.filter((d) => d.treatment === treatment);
        if (city) doctors = doctors.filter((d) => d.city === city);
        if (activeOnly === '1' || activeOnly === 'true') {
            doctors = doctors.filter((d) => d.available && d.totalTokens < d.maxTokens);
        }
        if (search && String(search).trim()) {
            const q = String(search).toLowerCase().trim();
            doctors = doctors.filter(
                (d) =>
                    d.fullName.toLowerCase().includes(q) ||
                    d.degree.toLowerCase().includes(q) ||
                    d.specialization.toLowerCase().includes(q) ||
                    d.location.toLowerCase().includes(q)
            );
        }
        res.json({ doctors });
    } catch (err) {
        next(err);
    }
});

// GET /api/doctors/active
router.get('/active', async (req, res, next) => {
    try {
        const limit = parseIntInRange(req.query.limit, 1, 50) || 4;
        const doctors = (await db.getAllActiveDoctors()).slice(0, limit);
        res.json({ doctors });
    } catch (err) {
        next(err);
    }
});

// GET /api/doctors/:id
router.get('/:id', async (req, res, next) => {
    try {
        const doctor = await db.getDoctorById(req.params.id);
        if (!doctor) return res.status(404).json({ error: 'Doctor not found.' });
        res.json({ doctor });
    } catch (err) {
        next(err);
    }
});

// POST /api/doctors (Apply for listing, requires Doctor role)
router.post('/', requireAuth, requireRole('doctor'), async (req, res, next) => {
    try {
        const b = req.body || {};
        const errors = [];
        if (requireString(b.fullName, 'Full name', { minLength: 3, maxLength: 100 }) !== null) errors.push('Full name is required.');
        if (!['Allopathy', 'Homoeopathy', 'Ayurvedic'].includes(b.treatment)) errors.push('Invalid treatment category.');
        if (requireString(b.specialization, 'Specialization', { minLength: 2, maxLength: 100 }) !== null) errors.push('Specialization is required.');
        if (requireString(b.degree, 'Degree', { minLength: 2, maxLength: 100 }) !== null) errors.push('Degree is required.');
        const experience = parseIntInRange(b.experience, 0, 70);
        if (experience === null) errors.push('Experience must be a number between 0 and 70.');
        if (requireString(b.location, 'Chamber address', { minLength: 5, maxLength: 250 }) !== null) errors.push('Chamber address is required.');
        if (requireString(b.city, 'City', { minLength: 2, maxLength: 60 }) !== null) errors.push('City is required.');
        const fees = parseIntInRange(b.fees, 0, 100000);
        if (fees === null) errors.push('Fees must be a non-negative number.');
        if (requireString(b.timings, 'Timings', { minLength: 3, maxLength: 60 }) !== null) errors.push('Timings are required.');
        if (requireString(b.days, 'Days', { minLength: 2, maxLength: 60 }) !== null) errors.push('Consulting days are required.');
        const maxTokens = parseIntInRange(b.maxTokens, 1, 200);
        if (maxTokens === null) errors.push('Max tokens must be between 1 and 200.');

        if (errors.length) return res.status(400).json({ error: errors.join(' ') });

        const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        let fullName = String(b.fullName).trim();
        if (!/^dr\.?/i.test(fullName)) {
            fullName = 'Dr. ' + fullName;
        }

        const newDoctor = {
            id,
            fullName,
            gender: b.gender === 'female' ? 'female' : 'male',
            treatment: b.treatment,
            specialization: String(b.specialization).trim(),
            degree: String(b.degree).trim(),
            experience,
            location: String(b.location).trim(),
            city: String(b.city).trim(),
            fees,
            timings: String(b.timings).trim(),
            days: String(b.days).trim(),
            available: 1,
            currentToken: 0,
            totalTokens: 0,
            maxTokens,
        };
        const created = await db.insertDoctor(newDoctor);
        res.json({ doctor: created });
    } catch (err) {
        next(err);
    }
});

// POST /api/doctors/:id/advance (Testing helper, requires login)
router.post('/:id/advance', requireAuth, async (req, res, next) => {
    try {
        const advanced = await db.advanceDoctorQueue(req.params.id);
        if (!advanced) return res.status(400).json({ error: 'Queue cannot be advanced (already finished or doctor unavailable).' });
        const doctor = await db.getDoctorById(req.params.id);
        res.json({ doctor });
    } catch (err) {
        next(err);
    }
});

// POST /api/doctors/:id/reset (Testing helper, requires login)
router.post('/:id/reset', requireAuth, async (req, res, next) => {
    try {
        await db.resetDoctorQueue(req.params.id);
        const doctor = await db.getDoctorById(req.params.id);
        res.json({ doctor });
    } catch (err) {
        next(err);
    }
});

export default router;
