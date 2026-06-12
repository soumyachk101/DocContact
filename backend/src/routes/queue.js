import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { queueEvents, QUEUE_EVENT } from '../services/simulator.js';

const router = express.Router();

// GET /api/queue/stream (SSE queue events, requires login)
router.get('/stream', requireAuth, (req, res) => {
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
    });
    res.flushHeaders?.();

    const send = (payload) => {
        try {
            res.write(`event: ${QUEUE_EVENT}\ndata: ${JSON.stringify(payload)}\n\n`);
        } catch {
            // Socket may already be closed
        }
    };

    queueEvents.on(QUEUE_EVENT, send);

    // Keep-alive heartbeat comment every 25s
    const heartbeat = setInterval(() => {
        try {
            res.write(`: ping\n\n`);
        } catch {
            // Ignore
        }
    }, 25_000);

    req.on('close', () => {
        clearInterval(heartbeat);
        queueEvents.off(QUEUE_EVENT, send);
    });
});

export default router;
