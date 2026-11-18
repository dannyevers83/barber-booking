// ─── Booking API ─────────────────────────────────────────────────────

export async function createBooking(booking) {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(booking),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Unable to submit your booking');
  }

  return data;
}
