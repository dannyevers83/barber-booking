// ─── Imports ───────────────────────────────────────────────────────

import pool from '../db/pool.js';

// ─── Create booking ────────────────────────────────────────────────

export async function insertBooking(booking, service) {
  const result = await pool.query(
    `INSERT INTO bookings (
      service_id,
      appointment_date,
      appointment_time,
      duration_minutes,
      price_cents,
      customer_name,
      customer_email,
      customer_phone
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id`,
    [
      service.id,
      booking.date,
      booking.time,
      service.duration_minutes,
      service.price_cents,
      booking.customerName,
      booking.customerEmail,
      booking.customerPhone,
    ],
  );

  return result.rows[0];
}

// ─── Read bookings for a date ──────────────────────────────────────

export async function getBookingsForDate(date) {
  const result = await pool.query(
    `SELECT appointment_time, duration_minutes
    FROM bookings
    WHERE appointment_date = $1
    ORDER BY appointment_time`,
    [date],
  );

  return result.rows;
}
