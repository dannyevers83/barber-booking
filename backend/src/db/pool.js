// ─── Imports ─────────────────────────────────────────────────────────

import { Pool } from 'pg';

// ─── Hosted connection or local Docker configuration ─────────────────

const connectionString =
  process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

const connectionOptions = connectionString
  ? {
      connectionString,
      connectionTimeoutMillis: 10000,
      max: 5,
    }
  : {
      host: '127.0.0.1',
      port: 5433,
      database: 'barber_booking',
      user: 'barber_app',
      password: process.env.POSTGRES_PASSWORD,
    };

// ─── Shared connection pool ──────────────────────────────────────────

const pool = new Pool(connectionOptions);

export default pool;
