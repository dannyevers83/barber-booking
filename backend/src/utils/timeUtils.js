// ─── Imports ────────────────────────────────────────────────────────────

import { bookingConfig } from '../config/bookingConfig.js';

// ─── Convert time to minutes ───────────────────────────────────────

export function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);

  return hours * 60 + minutes;
}

// ─── Convert minutes to time ───────────────────────────────────────

export function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// ─── Current time in the shop time zone ─────────────────────────────

export function getCurrentTimeInMinutes() {
  const currentTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: bookingConfig.timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date());

  return timeToMinutes(currentTime);
}

// ─── Today's date in the shop time zone ─────────────────────────────

export function getTodayDate() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: bookingConfig.timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  return ['year', 'month', 'day']
    .map((type) => parts.find((part) => part.type === type).value)
    .join('-');
}

// ─── Check whether the shop is closed ──────────────────────────────

export function isClosedDay(date) {
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();

  return bookingConfig.closedWeekdays.includes(weekday);
}
