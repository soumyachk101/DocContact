const net = require('net');

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

let host = 'localhost';
let port = 5432;

// Basic URL extraction matching standard postgresql connection strings
try {
  // Simple extraction of host:port from postgresql://user:pass@host:port/db
  const parts = dbUrl.split('@');
  if (parts.length > 1) {
    const hostPortPart = parts[1].split('/')[0];
    const hostPort = hostPortPart.split(':');
    host = hostPort[0];
    if (hostPort.length > 1) {
      port = parseInt(hostPort[1], 10);
    }
  }
} catch (e) {
  console.warn("Failed to parse DATABASE_URL host/port, falling back to localhost:5432");
}

console.log(`Waiting for database at ${host}:${port}...`);
const maxAttempts = 30;
let attempts = 0;

function tryConnect() {
  const socket = net.createConnection({ host, port });
  socket.setTimeout(1000);
  
  socket.on('connect', () => {
    socket.end();
    console.log("Database port is open and ready!");
    process.exit(0);
  });
  
  const handleFail = () => {
    socket.destroy();
    attempts++;
    if (attempts >= maxAttempts) {
      console.error(`Database not reachable on ${host}:${port} after ${maxAttempts} attempts. Exiting.`);
      process.exit(1);
    }
    setTimeout(tryConnect, 1000);
  };
  
  socket.on('error', handleFail);
  socket.on('timeout', handleFail);
}

tryConnect();
