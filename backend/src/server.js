// ─── Imports ────────────────────────────────────────────────────────────
import app from './app.js';
import { initializeDatabase } from './db/initializeDatabase.js';
import pool from './db/pool.js';
import { Pool } from 'pg';
import { transferDatabase } from './db/transferDatabase.js';

// ─── Server startup ────────────────────────────────────────────────────
const port = Number(process.env.PORT) || 3000;

if (
  process.env.AUTO_MIGRATE === 'true' ||
  process.env.TRANSFER_TO_NEON === 'true'
) {
  try {
    await initializeDatabase();
    console.log('Database migrations completed.');

    if (process.env.TRANSFER_TO_NEON === 'true') {
      if (process.env.BOOKING_MAINTENANCE !== 'true') {
        throw new Error(
          'Booking maintenance must be enabled before transferring data.',
        );
      }
      const sourceUrl = new URL(process.env.DATABASE_URL);
      const targetUrl = new URL(process.env.NEON_DATABASE_URL);
      if (
        sourceUrl.host === targetUrl.host &&
        sourceUrl.pathname === targetUrl.pathname
      ) {
        throw new Error('Source and destination must be different databases.');
      }
      if (!targetUrl.hostname.endsWith('.neon.tech')) {
        throw new Error(
          'The migration destination must be the configured Neon database.',
        );
      }
      const sourcePool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 1,
        connectionTimeoutMillis: 10000,
      });
      try {
        const summary = await transferDatabase(
          sourcePool,
          pool,
          `${sourceUrl.host}${sourceUrl.pathname}`,
        );
        console.log('Database transfer verified:', JSON.stringify(summary));
      } finally {
        await sourcePool.end();
      }
    }
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
