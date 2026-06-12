import express from 'express';
import {
    getDoctors,
    getActiveDoctors,
    getDoctorById,
    applyDoctorListing,
    advanceDoctorQueue,
    resetDoctorQueue,
} from '../controllers/doctorsController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/active', getActiveDoctors);
router.get('/:id', getDoctorById);
router.post('/', requireAuth, requireRole('doctor'), applyDoctorListing);
router.post('/:id/advance', requireAuth, advanceDoctorQueue);
router.post('/:id/reset', requireAuth, resetDoctorQueue);

export default router;
