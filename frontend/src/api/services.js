// ─── Service API ────────────────────────────────────────────────────────
export async function getServices() {
  const response = await fetch('/api/services');

  if (!response.ok) {
    throw new Error('Unable to load services.');
  }

  return response.json();
}
