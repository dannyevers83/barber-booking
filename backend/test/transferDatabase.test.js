// ─── Imports ─────────────────────────────────────────────────────────

import assert from 'node:assert/strict';
import test from 'node:test';
import { transferDatabase } from '../src/db/transferDatabase.js';

// ─── Example database rows ───────────────────────────────────────────

const service = {
  id: 'haircut',
  name: 'Haircut',
  duration_minutes: 30,
  price_cents: 3000,
};
const booking = {
  id: 'f8d001a9-c1f8-4e42-aa77-f84ae414448b',
  service_id: 'haircut',
  appointment_date: '2099-12-01',
  appointment_time: '15:00:00',
  duration_minutes: 30,
  price_cents: 3000,
  customer_name: 'Test Customer',
  customer_email: 'test@example.com',
  customer_phone: '0612345678',
  created_at: '2026-11-18T02:00:00.123456Z',
};

// ─── In-memory database clients ──────────────────────────────────────

function fixtures({
  completed = false,
  existing = 0,
  corrupt = false,
  failInsert = false,
} = {}) {
  const calls = [];
  let releases = 0;
  const source = {
    async query(sql) {
      calls.push(['source', sql]);
      if (sql.includes('FROM services ORDER BY id')) return { rows: [service] };
      if (sql.includes('FROM bookings ORDER BY id')) return { rows: [booking] };
      return { rows: [] };
    },
    release() {
      releases++;
    },
  };
  const target = {
    async query(sql, values) {
      calls.push(['target', sql, values]);
      if (sql.startsWith('SELECT services_count'))
        return {
          rows: completed ? [{ services_count: 1, bookings_count: 1 }] : [],
        };
      if (sql.startsWith('SELECT count'))
        return { rows: [{ count: existing }] };
      if (sql.includes('INSERT INTO bookings') && failInsert)
        throw new Error('Simulated write failure');
      if (sql.includes('FROM services ORDER BY id')) return { rows: [service] };
      if (sql.includes('FROM bookings ORDER BY id'))
        return {
          rows: [
            {
              ...booking,
              customer_phone: corrupt ? 'different' : booking.customer_phone,
            },
          ],
        };
      return { rows: [] };
    },
    release() {
      releases++;
    },
  };
  return {
    sourcePool: { connect: async () => source },
    targetPool: { connect: async () => target },
    calls,
    released: () => releases,
  };
}

// ─── Successful transfer ─────────────────────────────────────────────

test('copies all booking fields, preserving UUID and timestamp microseconds', async () => {
  const f = fixtures();
  const result = await transferDatabase(
    f.sourcePool,
    f.targetPool,
    'source/database',
  );
  assert.deepEqual(result, {
    services_count: 1,
    bookings_count: 1,
    alreadyCompleted: false,
  });
  const insert = f.calls.find(
    ([side, sql]) => side === 'target' && sql.includes('INSERT INTO bookings'),
  );
  assert.deepEqual(insert[2], Object.values(booking));
  assert.ok(
    f.calls.some(
      ([side, sql]) => side === 'source' && sql.includes('READ ONLY'),
    ),
  );
  assert.equal(f.released(), 2);
  assert.ok(!f.calls.some(([, sql]) => sql === 'ROLLBACK'));
});

// ─── Repeated transfer ───────────────────────────────────────────────

test('restarting after a completed transfer does not copy data again', async () => {
  const f = fixtures({ completed: true });
  const result = await transferDatabase(
    f.sourcePool,
    f.targetPool,
    'source/database',
  );
  assert.equal(result.alreadyCompleted, true);
  assert.ok(!f.calls.some(([, sql]) => sql.includes('INSERT INTO bookings')));
  assert.equal(f.released(), 2);
});

// ─── Destination protection ──────────────────────────────────────────

test('refuses to overwrite a destination that already contains bookings', async () => {
  const f = fixtures({ existing: 1 });
  await assert.rejects(
    transferDatabase(f.sourcePool, f.targetPool, 'source/database'),
    /already contains bookings/,
  );
  assert.ok(!f.calls.some(([, sql]) => sql.includes('INSERT INTO bookings')));
  assert.ok(
    f.calls.some(([side, sql]) => side === 'target' && sql === 'ROLLBACK'),
  );
  assert.equal(f.released(), 2);
});

// ─── Data verification ───────────────────────────────────────────────

test('rolls back when copied data differs from the source', async () => {
  const f = fixtures({ corrupt: true });
  await assert.rejects(
    transferDatabase(f.sourcePool, f.targetPool, 'source/database'),
    /Verification failed/,
  );
  assert.ok(
    f.calls.some(([side, sql]) => side === 'target' && sql === 'ROLLBACK'),
  );
  assert.ok(
    !f.calls.some(([side, sql]) => side === 'target' && sql === 'COMMIT'),
  );
  assert.equal(f.released(), 2);
});

// ─── Failed writes and cleanup ───────────────────────────────────────

test('releases both connections and rolls back after a database write fails', async () => {
  const f = fixtures({ failInsert: true });
  await assert.rejects(
    transferDatabase(f.sourcePool, f.targetPool, 'source/database'),
    /Simulated write failure/,
  );
  assert.ok(
    f.calls.some(([side, sql]) => side === 'target' && sql === 'ROLLBACK'),
  );
  assert.ok(
    f.calls.some(([side, sql]) => side === 'source' && sql === 'ROLLBACK'),
  );
  assert.equal(f.released(), 2);
});
