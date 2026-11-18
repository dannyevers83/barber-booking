// ─── Imports ─────────────────────────────────────────────────────────

import { getTodayDate } from '../utils/timeUtils.js';

// ─── Appointment date validation ─────────────────────────────────────

export function validateAppointmentDate(dateValue) {
  // ─── Date input and format ─────────────────────────────────────────

  if (typeof dateValue !== 'string' || !dateValue.trim()) {
    return 'Please select an appointment date.';
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!datePattern.test(dateValue.trim())) {
    return 'Please enter a date in YYYY-MM-DD format';
  }

  // ─── Calendar date ─────────────────────────────────────────────────

  const date = dateValue.trim();
  const parsedDate = new Date(`${date}T00:00:00Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== date
  ) {
    return 'Please enter a valid calendar date';
  }

  // ─── Earliest date in the shop time zone ───────────────────────────

  const today = getTodayDate();

  if (date < today) {
    return 'Please choose today or a future date.';
  }

  return null;
}
