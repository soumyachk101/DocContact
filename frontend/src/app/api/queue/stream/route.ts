// GET /api/queue/stream — Server-Sent Events stream of queue updates.
// Auth-required. Each connected client receives a `queueUpdated` event
// every time the simulator (or the advance/reset endpoints) ticks.

import { NextResponse } from 'next/server';
import { getQueueBus, QUEUE_EVENT } from '@server/queue-bus';
import { auth } from '@lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: { message: 'Authentication required.' } }, { status: 401 });
    }

    const bus = getQueueBus();
    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
        start(controller) {
            const send = (event: string, data: unknown) => {
                try {
                    controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
                } catch {
                    // controller may be closed
                }
            };

            // 1) ready beacon
            send('ready', { ts: Date.now() });

            // 2) subscribe to bus
            const onUpdate = (payload: unknown) => send(QUEUE_EVENT, payload);
            bus.on(QUEUE_EVENT, onUpdate);

            // 3) keep-alive every 25s
            const heartbeat = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(`: ping\n\n`));
                } catch {
                    // ignore
                }
            }, 25_000);

            // 4) tear down on client disconnect
            req.signal.addEventListener('abort', () => {
                clearInterval(heartbeat);
                bus.off(QUEUE_EVENT, onUpdate);
                try {
                    controller.close();
                } catch {
                    // ignore
                }
            });
        },
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
}
