import app from './app.js';
import { startQueueSimulator } from './services/simulator.js';
import prisma from './db/db.js';

const PORT = process.env.PORT || 3000;

startQueueSimulator();

const server = app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`\nZen Doctor server running at http://localhost:${PORT}`);
    console.log(`  - API base:  http://localhost:${PORT}/api`);
    console.log(`  - Vite dev:  http://localhost:5173 (run "npm run dev:client")`);
    console.log(`  - Test creds: patient@gmail.com / password123  (patient)`);
    console.log(`               doctor@zoomdoctor.in / password123 (chamber owner)\n`);
});

// Graceful shutdown — close Prisma client so connections don't leak.
async function shutdown(signal) {
    // eslint-disable-next-line no-console
    console.log(`\n${signal} received — shutting down...`);
    server.close(() => {});
    try {
        await prisma.$disconnect();
    } catch {
        // ignore
    }
    process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
