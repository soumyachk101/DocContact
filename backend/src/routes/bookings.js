import express from 'express';
import { requireString, isValidPhone } from '../utils/validate.js';
import db from '../services/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/bookings (Create booking, requires login)
router.post('/', requireAuth, async (req, res, next) => {
    try {
        const b = req.body || {};
        const errors = [];
        if (requireString(b.doctorId, 'Doctor', { minLength: 1, maxLength: 60 }) !== null) errors.push('Doctor is required.');
        if (requireString(b.bookingDate, 'Booking date') !== null) errors.push('Booking date is required.');
        if (requireString(b.timeSlot, 'Time slot') !== null) errors.push('Time slot is required.');
        if (requireString(b.patientName, 'Patient name', { minLength: 2, maxLength: 100 }) !== null) errors.push('Patient name is required.');
        if (!isValidPhone(b.patientPhone)) errors.push('A 10-digit phone number is required.');
        if (requireString(b.patientAge, 'Patient age') !== null) errors.push('Patient age is required.');
        if (!['Male', 'Female', 'Other'].includes(b.patientGender)) errors.push('Invalid gender.');

        if (errors.length) return res.status(400).json({ error: errors.join(' ') });

        const bookingId = `bk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const booking = await db.bookAppointmentTransaction({
            bookingId,
            userId: req.user.id,
            doctorId: b.doctorId,
            patientName: String(b.patientName).trim(),
            patientPhone: String(b.patientPhone).trim(),
            patientAge: String(b.patientAge).trim(),
            patientGender: b.patientGender,
            bookingDate: b.bookingDate,
            timeSlot: b.timeSlot,
        });
        res.json({ booking });
    } catch (err) {
        if (err && err.message && (err.message.includes('full') || err.message.includes('not found'))) {
            return res.status(400).json({ error: err.message });
        }
        next(err);
    }
});

// GET /api/bookings (Retrieve current user's bookings, requires login)
router.get('/', requireAuth, async (req, res, next) => {
    try {
        const bookings = await db.getBookingsByUser(req.user.id);
        res.json({ bookings });
    } catch (err) {
        next(err);
    }
});

export default router;
