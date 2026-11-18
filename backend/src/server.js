// ─── Imports ────────────────────────────────────────────────────────────
import app from './app.js';
import { initializeDatabase } from './db/initializeDatabase.js';
import pool from './db/pool.js';

// ─── Server startup ────────────────────────────────────────────────────
const port = Number(process.env.PORT) || 3000;

if (process.env.AUTO_MIGRATE === 'true') {
  try {
    await initializeDatabase();
    console.log('Database migrations completed.');
  } catch (error) {
    console.error('Database initialization failed:', error.code || error.name);
    await pool.end();
    process.exit(1);
  }
}

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
});

// ─── Graceful shutdown ─────────────────────────────────────────────

function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);
