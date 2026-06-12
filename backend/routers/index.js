import express from 'express';
import authRouter from './auth.js';
import doctorsRouter from './doctors.js';
import bookingsRouter from './bookings.js';
import queueRouter from './queue.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/doctors', doctorsRouter);
router.use('/bookings', bookingsRouter);
router.use('/queue', queueRouter);

export default router;
