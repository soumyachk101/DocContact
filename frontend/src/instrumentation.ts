// Server-side startup hooks. Next.js calls `register()` once when the
// Node.js server boots. We use it to start the in-process queue
// simulator; on Vercel, disable the in-process timer and rely on the
// cron-driven tick route instead.

export async function register() {
    if (process.env.QUEUE_SIMULATOR_DISABLED === '1') {
        return;
    }
    if (process.env.NEXT_RUNTIME !== 'nodejs') {
        return;
    }
    const { startQueueSimulator } = await import('./server/simulator');
    startQueueSimulator();
     
    console.log('[instrumentation] queue simulator started');
}
