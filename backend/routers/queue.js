import express from 'express';
import { streamQueueEvents } from '../controllers/queueController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/stream', requireAuth, streamQueueEvents);

export default router;
