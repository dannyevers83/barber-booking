// ─── Imports ────────────────────────────────────────────────────────────
import { validateBooking } from '../validators/bookingValidator.js';
import { getServiceById } from '../models/serviceModel.js';
import { insertBooking } from '../models/bookingModel.js';
import { generateTimeSlots } from '../services/availabilityService.js';
import {
  getTodayDate,
  getCurrentTimeInMinutes,
  timeToMinutes,
} from '../utils/timeUtils.js';

// ─── Booking controller ────────────────────────────────────────────────
export async function createBooking(req, res) {
  // ─── Short maintenance window during a database transfer ──────────
  if (process.env.BOOKING_MAINTENANCE === 'true') {
    return res.status(503).json({
      error:
        'Bookings are temporarily paused for maintenance. Please try again shortly.',
    });
  }

  // ─── Validate request ─────────────────────────────────────────────────
  const booking = req.body;
  const error = validateBooking(booking);

  if (error) {
    return res.status(400).json({ error });
  }

  // ─── Clean validated data ────────────────────────────────────────────
  const cleanedBooking = {
    serviceId: booking.serviceId.trim(),
    date: booking.date.trim(),
    time: booking.time.trim(),
    customerName: booking.customerName.trim(),
    customerEmail: booking.customerEmail.trim(),
    customerPhone: booking.customerPhone.trim(),
  };

  // ─── Check service in database ─────────────────────────────────────
  try {
    const service = await getServiceById(cleanedBooking.serviceId);

    if (!service) {
      return res.status(400).json({
        error: 'Please select an available service.',
      });
    }

    // ─── Check appointment time ────────────────────────────────────────
    const validTimes = generateTimeSlots(service.duration_minutes);

    if (!validTimes.includes(cleanedBooking.time)) {
      return res.status(400).json({
        error: 'Please select a valid appointment time.',
      });
    }

    // ─── Reject elapsed times today ────────────────────────────────────

    if (
      cleanedBooking.date === getTodayDate() &&
      timeToMinutes(cleanedBooking.time) <= getCurrentTimeInMinutes()
    ) {
      return res.status(400).json({
        error: 'Please choose a future appointment time.',
      });
    }

    // ─── Save booking ──────────────────────────────────────────────────

    const savedBooking = await insertBooking(cleanedBooking, service);

    res.status(201).json({
      message: 'Your appointment has been booked.',
      bookingId: savedBooking.id,
    });
  } catch (error) {
    if (error.code === '23P01' && error.constraint === 'bookings_no_overlap') {
      return res.status(409).json({
        error: 'This time is no longer available. Please choose another time.',
      });
    }

    console.error('Unable to process booking:', error.message);

    res.status(500).json({
      error: 'Unable to process your booking',
    });
  }
}
