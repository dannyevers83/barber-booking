// ─── Imports ─────────────────────────────────────────────────────────

import { createHash } from 'node:crypto';

// ─── Transfer queries ────────────────────────────────────────────────

const serviceQuery = `SELECT id, name, duration_minutes, price_cents
  FROM services ORDER BY id`;

const bookingQuery = `SELECT id, service_id,
  appointment_date::text AS appointment_date,
  appointment_time::text AS appointment_time,
  duration_minutes, price_cents, customer_name, customer_email,
  customer_phone,
  to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS created_at
  FROM bookings ORDER BY id`;

// ─── Database transfer ───────────────────────────────────────────────

export async function transferDatabase(sourcePool, targetPool, sourceIdentity) {
  const source = await sourcePool.connect();
  let target;
  let sourceOpen = false;
  let targetOpen = false;

  try {
    target = await targetPool.connect();

    // ─── Transaction setup ───────────────────────────────────────────

    await source.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    sourceOpen = true;
    await target.query('BEGIN');
    targetOpen = true;
    await target.query('SELECT pg_advisory_xact_lock(831106)');

    await target.query(`CREATE TABLE IF NOT EXISTS database_transfers (
      source_key TEXT PRIMARY KEY,
      services_count INTEGER NOT NULL,
      bookings_count INTEGER NOT NULL,
      completed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    // ─── Completed transfer check ────────────────────────────────────

    const sourceKey = createHash('sha256').update(sourceIdentity).digest('hex');
    const completed = await target.query(
      'SELECT services_count, bookings_count FROM database_transfers WHERE source_key = $1',
      [sourceKey],
    );

    if (completed.rows.length) {
      await target.query('COMMIT');
      targetOpen = false;
      await source.query('COMMIT');
      sourceOpen = false;
      return { ...completed.rows[0], alreadyCompleted: true };
    }

    // ─── Destination protection ──────────────────────────────────────

    const existing = await target.query(
      'SELECT count(*)::integer AS count FROM bookings',
    );
    if (existing.rows[0].count !== 0) {
      throw new Error(
        'The destination already contains bookings. Transfer stopped.',
      );
    }

    // ─── Source snapshot ─────────────────────────────────────────────

    const services = (await source.query(serviceQuery)).rows;
    const bookings = (await source.query(bookingQuery)).rows;

    // ─── Copy services ───────────────────────────────────────────────

    for (const service of services) {
      await target.query(
        `INSERT INTO services (id, name, duration_minutes, price_cents)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name,
           duration_minutes = EXCLUDED.duration_minutes, price_cents = EXCLUDED.price_cents`,
        [
          service.id,
          service.name,
          service.duration_minutes,
          service.price_cents,
        ],
      );
    }

    // ─── Copy bookings ───────────────────────────────────────────────

    for (const booking of bookings) {
      await target.query(
        `INSERT INTO bookings (id, service_id, appointment_date, appointment_time,
          duration_minutes, price_cents, customer_name, customer_email,
          customer_phone, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          booking.id,
          booking.service_id,
          booking.appointment_date,
          booking.appointment_time,
          booking.duration_minutes,
          booking.price_cents,
          booking.customer_name,
          booking.customer_email,
          booking.customer_phone,
          booking.created_at,
        ],
      );
    }

    // ─── Verify copied data ──────────────────────────────────────────

    // Compare every stored field, including UUIDs and original creation times.
    const copiedServices = (await target.query(serviceQuery)).rows;
    const copiedBookings = (await target.query(bookingQuery)).rows;
    if (
      JSON.stringify(services) !== JSON.stringify(copiedServices) ||
      JSON.stringify(bookings) !== JSON.stringify(copiedBookings)
    ) {
      throw new Error(
        'Verification failed. Destination changes will be rolled back.',
      );
    }

    // ─── Record completed transfer ───────────────────────────────────

    await target.query(
      `INSERT INTO database_transfers (source_key, services_count, bookings_count)
       VALUES ($1, $2, $3)`,
      [sourceKey, services.length, bookings.length],
    );
    await target.query('COMMIT');
    targetOpen = false;
    await source.query('COMMIT');
    sourceOpen = false;

    return {
      services_count: services.length,
      bookings_count: bookings.length,
      alreadyCompleted: false,
    };
  } catch (error) {
    // ─── Rollback on failure ─────────────────────────────────────────

    if (targetOpen) await target.query('ROLLBACK');
    if (sourceOpen) await source.query('ROLLBACK');
    throw error;
  } finally {
    // ─── Release connections ─────────────────────────────────────────

    target?.release();
    source.release();
  }
}
