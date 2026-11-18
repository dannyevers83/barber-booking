// ─── Imports ─────────────────────────────────────────────────────────

import { getServiceById } from '../models/serviceModel.js';
import { getBookingsForDate } from '../models/bookingModel.js';
import { getAvailableTimeSlots } from '../services/availabilityService.js';
import { validateAvailability } from '../validators/availabilityValidator.js';

// ─── Availability controller ─────────────────────────────────────────

export async function getAvailability(req, res) {
  // ─── Validate query parameters ─────────────────────────────────────

  const { serviceId, date } = req.query;

  const error = validateAvailability(serviceId, date);

  if (error) {
    return res.status(400).json({ error });
  }

  try {
    // ─── Load the selected service ───────────────────────────────────

    const service = await getServiceById(serviceId.trim());

    if (!service) {
      return res.status(400).json({
        error: 'Please select an available service.',
      });
    }

    // ─── Read existing bookings and calculate availability ───────────

    const bookings = await getBookingsForDate(date.trim());

    const slots = getAvailableTimeSlots(
      service.duration_minutes,
      bookings,
      date.trim(),
    );

    res.json({ slots });
  } catch (error) {
    console.error('Unable to load availability:', error.message);

    res.status(500).json({
      error: 'Unable to load available times.',
    });
  }
}
