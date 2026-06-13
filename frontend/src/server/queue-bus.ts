// Singleton EventEmitter that the simulator and SSE subscribers share.
// Pinned to `globalThis` so the simulator's `setInterval` and the
// subscribers' listeners all attach to the same instance across HMR
// reloads (and across server-component / route-handler module caches).

import { EventEmitter } from 'node:events';

export const QUEUE_EVENT = 'queueUpdated';

export interface QueueUpdatePayload {
    doctorId: string;
    newCurrentToken: number;
}

declare global {
     
    var __zenQueueBus: EventEmitter | undefined;
}

const bus: EventEmitter = global.__zenQueueBus ?? new EventEmitter();
bus.setMaxListeners(0);
if (process.env.NODE_ENV !== 'production') {
    global.__zenQueueBus = bus;
}

export function getQueueBus(): EventEmitter {
    return bus;
}

export function emitQueueUpdate(payload: QueueUpdatePayload): void {
    bus.emit(QUEUE_EVENT, payload);
}
