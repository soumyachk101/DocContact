import { EventEmitter } from 'events';
import db from './db.js';

const queueEvents = new EventEmitter();
const QUEUE_EVENT = 'queueUpdated';
const TICK_MS = 25_000;

async function tick() {
    try {
        const doctors = await db.getAllDoctors();
        for (const doc of doctors) {
            if (!doc.available) continue;
            if (doc.currentToken >= doc.totalTokens) continue;
            if (Math.random() > 0.4) {
                const ok = await db.advanceDoctorQueue(doc.id);
                if (ok) {
                    queueEvents.emit(QUEUE_EVENT, {
                        doctorId: doc.id,
                        newCurrentToken: doc.currentToken + 1,
                    });
                }
            }
        }
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Queue simulator tick failed:', err);
    }
}

function startQueueSimulator() {
    if (queueEvents.interval) return; // single shared timer
    queueEvents.interval = setInterval(tick, TICK_MS);
}

function stopQueueSimulator() {
    if (queueEvents.interval) {
        clearInterval(queueEvents.interval);
        queueEvents.interval = null;
    }
}

export { startQueueSimulator, stopQueueSimulator, queueEvents, QUEUE_EVENT };
export default { startQueueSimulator, stopQueueSimulator, queueEvents, QUEUE_EVENT };
