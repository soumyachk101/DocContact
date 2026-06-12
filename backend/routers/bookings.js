import express from 'express';
import { createBooking, getUserBookings } from '../controllers/bookingsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, createBooking);
router.get('/', requireAuth, getUserBookings);

export default router;
