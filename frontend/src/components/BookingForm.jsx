// ─── Imports ────────────────────────────────────────────────────────────
import { useState } from 'react';

import { createBooking } from '@/api/bookings';

// ─── Booking form component ────────────────────────────────────────────
function BookingForm({ serviceId, date, time, onBookingSuccess }) {
  // ─── Customer details state ───────────────────────────────────────────
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  // ─── Submission state ─────────────────────────────────────────────────
  const [bookingError, setBookingError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Booking submission ──────────────────────────────────────────────
  async function handleBookingSubmit(event) {
    event.preventDefault();

    setBookingError('');

    const booking = {
      serviceId,
      date,
      time,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
    };

    if (
      !booking.customerName ||
      !booking.customerEmail ||
      !booking.customerPhone
    ) {
      setBookingError(
        'Please enter your name, email address and phone number.',
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createBooking(booking);
      onBookingSuccess(result.message);
    } catch (error) {
      setBookingError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // ─── Form layout ─────────────────────────────────────────────────────
  return (
    <form onSubmit={handleBookingSubmit}>
      {/* ─── Full name ──────────────────────────────────────────────── */}

      <label htmlFor="customer-name" className="mt-6 block font-semibold">
        Full name
      </label>

      <input
        id="customer-name"
        name="name"
        type="text"
        autoComplete="name"
        required
        value={customerName}
        onChange={(event) => setCustomerName(event.target.value)}
        className="mt-2 w-full rounded-lg border border-input bg-background p-3"
      />

      {/* ─── Email address ──────────────────────────────────────────── */}

      <label htmlFor="customer-email" className="mt-4 block font-semibold">
        Email address
      </label>

      <input
        id="customer-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={customerEmail}
        onChange={(event) => setCustomerEmail(event.target.value)}
        className="mt-2 w-full rounded-lg border border-input bg-background p-3"
      />

      {/* ─── Phone number ───────────────────────────────────────────── */}

      <label htmlFor="customer-phone" className="mt-4 block font-semibold">
        Phone number
      </label>

      <input
        id="customer-phone"
        name="phone"
        type="tel"
        autoComplete="tel"
        required
        value={customerPhone}
        onChange={(event) => setCustomerPhone(event.target.value)}
        className="mt-2 w-full rounded-lg border border-input bg-background p-3"
      />

      {/* ─── Validation message ─────────────────────────────────────── */}

      {bookingError && (
        <p role="alert" className="mt-4 text-destructive">
          {bookingError}
        </p>
      )}

      {/* ─── Submit booking ─────────────────────────────────────────────── */}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        {isSubmitting ? 'Sending...' : 'Book appointment'}
      </button>
    </form>
  );
}

export default BookingForm;
