-- ─── Prevent overlapping bookings ──────────────────────────────────

ALTER TABLE bookings
ADD CONSTRAINT bookings_no_overlap
EXCLUDE USING gist (
  tsrange(
    appointment_date + appointment_time,
    appointment_date + appointment_time
      + make_interval(mins => duration_minutes),
    '[)'
  ) WITH &&
);