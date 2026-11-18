// ─── Imports ─────────────────────────────────────────────────────────

import { isValidPhoneNumber } from 'libphonenumber-js/max';
import { validateAppointmentDate } from './dateValidator.js';

// ─── Booking validation ──────────────────────────────────────────────

export function validateBooking(booking) {
  // ─── Request body ──────────────────────────────────────────────────

  if (!booking || typeof booking !== 'object' || Array.isArray(booking)) {
    return 'Please send a booking object.';
  }

  // ─── Service selection ─────────────────────────────────────────────

  if (typeof booking.serviceId !== 'string' || !booking.serviceId.trim()) {
    return 'Please select a service';
  }

  // ─── Appointment date ──────────────────────────────────────────────

  const dateError = validateAppointmentDate(booking.date);

  if (dateError) {
    return dateError;
  }

  // ─── Time input and format ─────────────────────────────────────────

  if (typeof booking.time !== 'string' || !booking.time.trim()) {
    return 'Please select an appointment time';
  }

  const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

  if (!timePattern.test(booking.time.trim())) {
    return 'Please enter a valid time in HH:mm format.';
  }

  // ─── Customer name ─────────────────────────────────────────────────

  if (
    typeof booking.customerName !== 'string' ||
    !booking.customerName.trim()
  ) {
    return 'Please enter your name.';
  }

  // ─── Customer email ────────────────────────────────────────────────

  if (
    typeof booking.customerEmail !== 'string' ||
    !booking.customerEmail.trim()
  ) {
    return 'Please enter your email address.';
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(booking.customerEmail.trim())) {
    return 'Please enter a valid email address';
  }

  // ─── Customer phone number ─────────────────────────────────────────

  if (
    typeof booking.customerPhone !== 'string' ||
    !booking.customerPhone.trim()
  ) {
    return 'Please enter your phone number.';
  }

  if (!isValidPhoneNumber(booking.customerPhone.trim(), 'NL')) {
    return 'Please enter a valid phone number.';
  }

  // ─── Validation complete ───────────────────────────────────────────

  return null;
}
