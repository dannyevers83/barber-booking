// ─── Imports ────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react';

import BookingForm from './components/BookingForm';
import DateTimeSelection from './components/DateTimeSelection';
import ServiceCard from './components/ServiceCard';

import { getServices } from './api/services';

import barbershopImage from './assets/barbershop.png';

// ─── App component ─────────────────────────────────────────────────────
function App() {
  // ─── Service loading state ────────────────────────────────────────────
  const [services, setServices] = useState([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState('');
  // ─── Booking selection state ──────────────────────────────────────────
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [dateError, setDateError] = useState('');

  // ─── Section references ──────────────────────────────────────────────
  const appointmentSectionRef = useRef(null);
  const timeSlotRef = useRef(null);
  const summaryRef = useRef(null);

  // ─── Selected service details ────────────────────────────────────────
  const selectedService = services.find(
    (service) => service.id === selectedServiceId,
  );

  // ─── Minimum booking date ────────────────────────────────────────────
  const [today] = useState(() => new Date());

  const minimumDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  // ─── Display date ────────────────────────────────────────────────────
  const formattedDate = selectedDate
    ? new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(`${selectedDate}T00:00:00`))
    : '';

  // ─── Event handlers ──────────────────────────────────────────────────
  function selectService(serviceId) {
    setSelectedServiceId(serviceId);
    setSelectedTime('');
  }

  function selectDate(date) {
    setSelectedTime('');

    if (date && date < minimumDate) {
      setSelectedDate('');
      setDateError('Please choose today or a future date.');
      return;
    }

    setDateError('');
    setSelectedDate(date);
  }

  // ─── Service loading effect ──────────────────────────────────────────
  useEffect(() => {
    let active = true;

    async function loadServices() {
      try {
        const data = await getServices();

        if (active) {
          setServices(data);
        }
      } catch {
        if (active) {
          setServicesError('Unable to load services. Please try again later.');
        }
      } finally {
        if (active) {
          setIsLoadingServices(false);
        }
      }
    }

    loadServices();

    return () => {
      active = false;
    };
  }, []);

  // ─── Booking step scrolling ──────────────────────────────────────────
  useEffect(() => {
    if (selectedServiceId) {
      appointmentSectionRef.current?.scrollIntoView({
        block: 'start',
      });
    }
  }, [selectedServiceId]);

  useEffect(() => {
    if (selectedServiceId && selectedDate) {
      timeSlotRef.current?.scrollIntoView({
        block: 'start',
      });
    }
  }, [selectedServiceId, selectedDate]);

  useEffect(() => {
    if (selectedServiceId && selectedDate && selectedTime) {
      summaryRef.current?.scrollIntoView({
        block: 'end',
      });
    }
  }, [selectedServiceId, selectedDate, selectedTime]);

  // ─── Page layout ─────────────────────────────────────────────────────
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      {/* ─── Introduction ───────────────────────────────────────────── */}

      <h1 className="text-3xl font-bold">Oak & Steel Barbers</h1>
      <p className="mt-4 mb-6 text-muted-foreground">
        Book your next appointment
      </p>

      <p className="text-sm text-muted-foreground">
        Demo website — appointments are for testing only. Please use sample
        contact details.
      </p>

      <img
        src={barbershopImage}
        alt="Leather barber chair in warmly lit barbershop"
        width={1672}
        height={941}
        className="mt-8 aspect-video w-full rounded-xl object-cover"
      />

      {/* ─── Service selection ──────────────────────────────────────── */}

      {isLoadingServices && (
        <p role="status" className="mt-8 text-muted-foreground">
          Loading services...
        </p>
      )}

      {servicesError && (
        <p role="alert" className="mt-8 text-destructive">
          {servicesError}
        </p>
      )}

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <li key={service.id}>
            <ServiceCard
              service={service}
              isSelected={selectedServiceId === service.id}
              onSelect={selectService}
            />
          </li>
        ))}
      </ul>

      {/* ─── Date and time selection ────────────────────────────────── */}

      {selectedServiceId && (
        <DateTimeSelection
          serviceId={selectedServiceId}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          minimumDate={minimumDate}
          onDateChange={selectDate}
          onTimeChange={setSelectedTime}
          appointmentSectionRef={appointmentSectionRef}
          timeSlotRef={timeSlotRef}
          dateError={dateError}
        />
      )}

      {/* ─── Appointment summary ────────────────────────────────────── */}

      {selectedService && selectedDate && selectedTime && (
        <section ref={summaryRef} className="mt-12 rounded-xl bg-card p-6">
          <h2 className="text-2xl font-bold">Your appointment</h2>
          <p className="mt-4">{selectedService.name}</p>
          <p className="mt-2 text-muted-foreground">
            {formattedDate} at {selectedTime}
          </p>
          <p className="mt-2">
            {selectedService.duration} minutes — €{selectedService.price}
          </p>

          {/* ─── Customer details ───────────────────────────────────── */}

          <BookingForm
            serviceId={selectedServiceId}
            date={selectedDate}
            time={selectedTime}
          />
        </section>
      )}
    </main>
  );
}

export default App;
