// ─── Imports ───────────────────────────────────────────────────────

import test from 'node:test';
import assert from 'node:assert/strict';

import { getAvailableTimeSlots } from '../src/services/availabilityService.js';

// ─── Closed days ───────────────────────────────────────────────────

test('returns no available times on Sunday', () => {
  const slots = getAvailableTimeSlots(30, [], '2030-06-16');

  assert.deepEqual(slots, []);
});

// ─── Open days ─────────────────────────────────────────────────────

test('offers opening time on an open Monday', () => {
  const slots = getAvailableTimeSlots(30, [], '2030-06-17');

  assert.ok(slots.includes('09:00'));
});

// ─── Booking overlap ───────────────────────────────────────────────

test('excludes times that overlap an existing booking', () => {
  const bookings = [
    {
      appointment_time: '10:00:00',
      duration_minutes: 30,
    },
  ];

  const slots = getAvailableTimeSlots(30, bookings, '2030-06-17');

  assert.equal(slots.includes('10:15'), false);
});

// ─── Adjacent appointments ─────────────────────────────────────────

test('allows an appointment immediately after an existing booking', () => {
  const bookings = [
    {
      appointment_time: '10:00:00',
      duration_minutes: 30,
    },
  ];

  const slots = getAvailableTimeSlots(30, bookings, '2030-06-17');

  assert.equal(slots.includes('10:30'), true);
});

// ─── Elapsed times ─────────────────────────────────────────────────

test('excludes elapsed times today', (t) => {
  t.mock.timers.enable({
    apis: ['Date'],
    now: new Date('2030-06-17T08:30:00Z'),
  });

  const slots = getAvailableTimeSlots(30, [], '2030-06-17');

  assert.equal(slots.includes('10:15'), false);
  assert.equal(slots.includes('10:30'), false);
  assert.equal(slots.includes('10:45'), true);
});

// ─── Future dates ──────────────────────────────────────────────────

test('keeps morning times available on a future open day', (t) => {
  t.mock.timers.enable({
    apis: ['Date'],
    now: new Date('2030-06-17T08:30:00Z'),
  });

  const slots = getAvailableTimeSlots(30, [], '2030-06-18');

  assert.equal(slots.includes('09:00'), true);
  assert.equal(slots.includes('10:15'), true);
});

// ─── Closing time ──────────────────────────────────────────────────

test('only offers times that fit before closing', () => {
  const slots = getAvailableTimeSlots(45, [], '2030-06-17');

  assert.equal(slots.includes('16:15'), true);
  assert.equal(slots.includes('16:30'), false);
});
