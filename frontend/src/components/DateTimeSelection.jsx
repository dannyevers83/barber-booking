// ─── Imports ────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar.jsx';
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
  availabilityVersion,
}) {
  // ─── Availability state ────────────────────────────────────────────

  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');

  // ─── Calendar date selection ───────────────────────────────────────

  function handleDateSelect(date) {
    if (!date) return;

    onDateChange(format(date, 'yyyy-MM-dd'));
  }

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
  }, [serviceId, selectedDate, availabilityVersion]);

  // ─── Selection layout ─────────────────────────────────────────────────
  return (
    <section ref={appointmentSectionRef} className="mt-12">
      {/* ─── Introduction ───────────────────────────────────────────── */}
      <h2 className="text-2xl font-bold">Choose a date and time</h2>
      <p className="mt-2 text-muted-foreground">
        Select an available appointment
      </p>
      <div className="mt-6 grid items-start gap-6 md:grid-cols-[auto_minmax(0,1fr)]">
        {/* ─── Date selection ─────────────────────────────────────────── */}
        <fieldset className="mt-6">
          <legend className="font-semibold">Appointment date</legend>

          <Calendar
            mode="single"
            selected={
              selectedDate ? new Date(`${selectedDate}T00:00:00`) : undefined
            }
            onSelect={handleDateSelect}
            disabled={[
              { before: new Date(`${minimumDate}T00:00:00`) },
              { dayOfWeek: [0] },
            ]}
            aria-label="Appointment date"
            aria-describedby={dateError ? 'date-error' : undefined}
            className="mt-2 rounded-lg border border-input bg-card [--cell-size:2.25rem] sm:[--cell-size:2.75rem]"
          />
          {dateError && (
            <p id="date-error" role="alert" className="mt-2 text-destructive">
              {dateError}
            </p>
          )}
        </fieldset>
        {/* ─── Time selection ─────────────────────────────────────────── */}
        {selectedDate ? (
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

            <div className="mt-2 grid grid-cols-3 gap-2">
              {availableSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => onTimeChange(time)}
                  aria-pressed={selectedTime === time}
                  className="rounded-lg border-2 border-transparent bg-card px-3 py-2 text-base aria-pressed:border-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  {time}
                </button>
              ))}
            </div>
          </fieldset>
        ) : (
          <fieldset className="mt-6">
            <legend className="font-semibold">Appointment time</legend>
            <p className="mt-2 text-muted-foreground">
              Choose a date to see available times.
            </p>
          </fieldset>
        )}
      </div>
    </section>
  );
}

export default DateTimeSelection;
