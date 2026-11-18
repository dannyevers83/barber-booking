// ─── Imports ─────────────────────────────────────────────────────────

import { readFile } from 'node:fs/promises';
import pool from './pool.js';

// ─── Ordered migrations and existing schema checks ───────────────────

const migrations = [
  [
    '001_create_services.sql',
    "SELECT to_regclass('public.services') IS NOT NULL AS exists",
  ],
  [
    '002_create_bookings.sql',
    "SELECT to_regclass('public.bookings') IS NOT NULL AS exists",
  ],
  [
    '003_prevent_overlapping_bookings.sql',
    "SELECT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_no_overlap' AND conrelid = 'public.bookings'::regclass) AS exists",
  ],
];

// ─── Database migrations ─────────────────────────────────────────────

export async function initializeDatabase() {
  const client = await pool.connect();

  try {
    // ─── Migration transaction ───────────────────────────────────────

    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(831105)');
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    // ─── Apply missing migrations ────────────────────────────────────

    for (const [name, existsQuery] of migrations) {
      const applied = await client.query(
        'SELECT name FROM schema_migrations WHERE name = $1',
        [name],
      );
      if (applied.rows.length) continue;

      // Recognize the migrations already applied manually during development.
      const existing = await client.query(existsQuery);
      if (!existing.rows[0].exists) {
        const sql = await readFile(
          new URL(`./migrations/${name}`, import.meta.url),
          'utf8',
        );
        await client.query(sql);
      }

      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [
        name,
      ]);
    }

    // ─── Seed reference data without replacing existing rows ─────────

    const seed = await readFile(
      new URL('./seeds/services.sql', import.meta.url),
      'utf8',
    );
    await client.query(
      seed.trim().replace(/;$/, '') + ' ON CONFLICT (id) DO NOTHING',
    );

    // ─── Complete initialization ─────────────────────────────────────

    await client.query('COMMIT');
  } catch (error) {
    // Roll back all initialization changes together.
    await client.query('ROLLBACK');
    throw error;
  } finally {
    // Return the checked-out connection to the shared pool.
    client.release();
  }
}
