// ─── Imports ───────────────────────────────────────────────────────

import { Pool } from 'pg';

// ─── Database connection pool ──────────────────────────────────────

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 10000,
        max: 5,
      }
    : {
        host: '127.0.0.1',
        port: 5433,
        database: 'barber_booking',
        user: 'barber_app',
        password: process.env.POSTGRES_PASSWORD,
      },
);

export default pool;
