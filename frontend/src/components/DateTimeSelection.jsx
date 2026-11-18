// ─── Imports ────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { getAvailability } from '../api/availability';

// ─── Date and time selection component ─────────────────────────────────
function DateTimeSelection({
  serviceId,
  selectedDate,
  selectedTime,
  minimumDate,
  dateError,
  onDateChange,
  onTimeChange,
  appointmentSectionRef,
  timeSlotRef,
}) {
  // ─── Availability state ────────────────────────────────────────────

  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');

  // ─── Load available times ──────────────────────────────────────────

  useEffect(() => {
    if (!serviceId || !selectedDate) {
      return;
    }

    let active = true;

    async function loadAvailability() {
      setIsLoadingAvailability(true);
      setAvailabilityError('');
      setAvailableSlots([]);

      try {
        const slots = await getAvailability(serviceId, selectedDate);

        if (active) {
          setAvailableSlots(slots);
        }
      } catch (error) {
        if (active) {
          setAvailabilityError(error.message);
        }
      } finally {
        if (active) {
          setIsLoadingAvailability(false);
        }
      }
    }

    loadAvailability();

    return () => {
      active = false;
    };
  }, [serviceId, selectedDate]);

  // ─── Selection layout ─────────────────────────────────────────────────
  return (
    <section ref={appointmentSectionRef} className="mt-12">
      {/* ─── Introduction ───────────────────────────────────────────── */}

      <h2 className="text-2xl font-bold">Choose a date and time</h2>
      <p className="mt-2 text-muted-foreground">
        Select an available appointment
      </p>

      {/* ─── Date selection ─────────────────────────────────────────── */}

      <label htmlFor="appointment-date" className="mt-6 block font-semibold">
        Appointment date
      </label>

      <input
        id="appointment-date"
        type="date"
        min={minimumDate}
        value={selectedDate}
        onChange={(event) => {
          onDateChange(event.target.value);
        }}
        className="mt-2 rounded-lg border border-input bg-card p-3"
        aria-invalid={Boolean(dateError)}
        aria-describedby={dateError ? 'date-error' : undefined}
      />

      {dateError && (
        <p id="date-error" role="alert" className="mt-2 text-destructive">
          {dateError}
        </p>
      )}

      {/* ─── Time selection ─────────────────────────────────────────── */}

      {selectedDate && (
        <fieldset ref={timeSlotRef} className="mt-6">
          <legend className="font-semibold">Appointment time</legend>

          {isLoadingAvailability && (
            <p role="status" className="mt-2 text-muted-foreground">
              Loading available times...
            </p>
          )}

          {availabilityError && (
            <p role="alert" className="mt-2 text-destructive">
              {availabilityError}
            </p>
          )}

          {!isLoadingAvailability &&
            !availabilityError &&
            availableSlots.length === 0 && (
              <p className="mt-2 text-muted-foreground">
                No available times for this date.
              </p>
            )}

          <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {availableSlots.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => onTimeChange(time)}
                aria-pressed={selectedTime === time}
                className="rounded-lg border-2 border-transparent bg-card px-4 py-3 aria-pressed:border-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                {time}
              </button>
            ))}
          </div>
        </fieldset>
      )}
    </section>
  );
}

export default DateTimeSelection;
