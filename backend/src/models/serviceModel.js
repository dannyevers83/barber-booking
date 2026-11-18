// ─── Imports ───────────────────────────────────────────────────────

import pool from '../db/pool.js';

// ─── Read services ─────────────────────────────────────────────────

export async function getAllServices() {
  const result = await pool.query(`
    SELECT id, name, duration_minutes, price_cents
    FROM services
    ORDER BY name
  `);

  return result.rows;
}

// ─── Read one service ──────────────────────────────────────────────

export async function getServiceById(serviceId) {
  const result = await pool.query(
    `SELECT id, name, duration_minutes, price_cents
    FROM services
    WHERE id = $1`,
    [serviceId],
  );

  return result.rows[0];
}
