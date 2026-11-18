// ─── Imports ───────────────────────────────────────────────────────

import { bookingConfig } from '../config/bookingConfig.js';
import {
  timeToMinutes,
  minutesToTime,
  getCurrentTimeInMinutes,
  getTodayDate,
} from '../utils/timeUtils.js';

// ─── Generate candidate times ──────────────────────────────────────

export function generateTimeSlots(durationMinutes) {
  const opening = timeToMinutes(bookingConfig.openingTime);
  const closing = timeToMinutes(bookingConfig.closingTime);
  const slots = [];

  for (
    let start = opening;
    start + durationMinutes <= closing;
    start += bookingConfig.slotIntervalMinutes
  ) {
    slots.push(minutesToTime(start));
  }

  return slots;
}

// ─── Check booking overlap ─────────────────────────────────────────

export function hasOverlap(start, end, bookings) {
  return bookings.some((booking) => {
    const bookingStart = timeToMinutes(booking.appointment_time);
    const bookingEnd = bookingStart + booking.duration_minutes;

    return start < bookingEnd && end > bookingStart;
  });
}

// ─── Find available times ──────────────────────────────────────────

export function getAvailableTimeSlots(durationMinutes, bookings, date) {
  const slots = generateTimeSlots(durationMinutes);
  const isToday = date === getTodayDate();
  const currentTime = getCurrentTimeInMinutes();

  return slots.filter((time) => {
    const start = timeToMinutes(time);
    const end = start + durationMinutes;

    if (isToday && start <= currentTime) {
      return false;
    }

    return !hasOverlap(start, end, bookings);
  });
}
