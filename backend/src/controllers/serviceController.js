// ─── Imports ────────────────────────────────────────────────────────────
import { getAllServices } from '../models/serviceModel.js';

// ─── Service controller ────────────────────────────────────────────────
export async function getServices(req, res) {
  try {
    const rows = await getAllServices();

    const services = rows.map((row) => ({
      id: row.id,
      name: row.name,
      duration: row.duration_minutes,
      price: row.price_cents / 100,
    }));

    res.json(services);
  } catch (error) {
    console.error('Unable to load services:', error.message);

    res.status(500).json({
      error: 'Unable to load services.',
    });
  }
}
