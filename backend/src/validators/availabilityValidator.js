// ─── Imports ────────────────────────────────────────────────────────────
import { validateAppointmentDate } from './dateValidator.js';

// ─── Availability validation ───────────────────────────────────────

export function validateAvailability(serviceId, date) {
  if (typeof serviceId !== 'string' || !serviceId.trim()) {
    return 'Please select a service.';
  }

  const dateError = validateAppointmentDate(date);

  if (dateError) {
    return dateError;
  }

  return null;
}
