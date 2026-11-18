// ─── Availability API ────────────────────────────────────────────────

export async function getAvailability(serviceId, date) {
  const query = new URLSearchParams({ serviceId, date });

  const response = await fetch(`/api/availability?${query}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Unable to load available times.');
  }

  return data.slots;
}
