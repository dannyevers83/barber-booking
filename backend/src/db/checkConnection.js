// ─── Imports ─────────────────────────────────────────────────────────

import pool from './pool.js';

// ─── Database connection check ───────────────────────────────────────

try {
  const result = await pool.query('SELECT 1 AS connected');
  console.log(result.rows);
} catch (error) {
  console.error('Database connection failed:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
