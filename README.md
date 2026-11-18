# Oak & Steel Barbers

A full-stack barber booking demo built with React, Vite, Tailwind CSS, Express and PostgreSQL.

Customers can select a service, choose an available time and submit their contact details. Bookings are saved in PostgreSQL. A database exclusion constraint prevents overlapping appointments for the single demo barber, including concurrent booking requests.

Elapsed appointment times are hidden for the current day and rejected when submitting a booking. Date and time checks use the Europe/Amsterdam time zone.

## Project structure

```text
frontend/
  src/
    App.jsx                 Booking state, page layout, and step scrolling
    components/
      AccountSection.jsx    Session status, account form, and sign-out
      AuthForm.jsx          Sign-up and sign-in fields and submission
      BookingForm.jsx       Customer details and booking submission
      DateTimeSelection.jsx Calendar and available appointment times
      ServiceCard.jsx       Selectable service card
      ui/                   Shared Calendar, Button, and button styles
    api/                    HTTP requests to the Express API
    lib/                    Neon Auth client and shared UI utility
    index.css               Theme tokens and base styles
  public/                   Favicon served from the website root
  .env.example              Public frontend configuration template
backend/
  src/
    app.js                  Express middleware, routes, and error responses
    server.js               Startup, optional initialization, and shutdown
    config/                 Shop timezone, hours, and closed weekdays
    routes/                 HTTP methods connected to controllers
    controllers/            Request handling and HTTP responses
    validators/             Incoming data and calendar date validation
    services/               Availability and overlap calculations
    models/                 Parameterized PostgreSQL queries
    utils/                  Date and time helpers
    db/                     Pool, initialization, transfer, migrations, and seeds
  test/                     Availability and database transfer tests
compose.yaml                Local PostgreSQL 18 database
render.yaml                 Hosted demo infrastructure
.env.example                Private backend configuration template
```

Source files use English section comments. Components follow the order imports, state and refs, derived values, event handlers, effects, and JSX. Backend files group configuration, validation, database work, responses, and cleanup according to their responsibility. Applied SQL migrations remain historical schema changes.

## Local development

Use Node.js 24 or later, Docker Compose and npm.

1. Copy `.env.example` to `.env` and set your own `POSTGRES_PASSWORD`.
2. From the repository root, start PostgreSQL with `sudo docker compose up -d`.
3. Install dependencies with `npm ci --prefix backend` and `npm ci --prefix frontend`.
4. Initialize a new database:

   ```bash
   cd backend
   AUTO_MIGRATE=true npm run dev
   ```

   Initialization also recognizes the three migrations already applied manually during development. It records migrations and adds missing starting services without deleting bookings or changing existing prices.

5. In another terminal, start the frontend:

   ```bash
   cd frontend
   npm run dev
   ```

Open the Vite URL shown in the terminal. Vite forwards `/api` requests to the local backend on port 3000. The Docker database uses host port 5433.

### Optional account development

The account UI uses Managed Better Auth through `@neon/auth`. `AccountSection` owns session and sign-out state; `AuthForm` owns registration and sign-in state. The account feature loads separately from the booking page, reducing the initial JavaScript bundle.

1. Enable Auth on a development branch in Neon, separate from the online production database.
2. Copy `frontend/.env.example` to `frontend/.env.local`.
3. Set `VITE_NEON_AUTH_URL` to that branch's HTTPS Auth Base URL, ending in `/neondb/auth`. This URL is public; it must not contain a PostgreSQL password or connection string.
4. Allow the local development origin in Neon Auth and restart Vite after changing the environment file.
5. Verify account creation, sign-in, sign-out, wrong-password feedback, and session restoration after reloading.

With this variable empty, the booking demo runs without the account section. For a hosted account UI, configure the production branch's Auth URL as a frontend build environment variable and allow the hosted origin in Neon Auth before rebuilding. Do not point the public demo at the development auth branch.

Authentication is currently a frontend feature under development. The Express booking endpoints remain public, and bookings are not linked to account IDs yet. Signing in does not provide a protected appointment dashboard or backend authorization. Those are separate upcoming steps.

## Online demo on Render

The live demo runs on a free Render Node web service with PostgreSQL 18 on Neon Free, both in Frankfurt. The original Render database is retained temporarily as a rollback copy. The root `render.yaml` keeps that resource declared so a Blueprint sync does not remove it unexpectedly.

The build installs both applications and builds the frontend. Express serves the built frontend and `/api` endpoints from the same domain. The server reads `DATABASE_URL` from Render's environment settings; local passwords and test bookings are not uploaded. Before listening for requests, the server runs migrations and inserts the four starting services. Startup fails if initialization fails.

### Moving the online database to Neon

The Render-to-Neon transfer was completed on 18 November 2026. All four services and the existing booking were copied and compared field by field, and the final application deployment is live with booking maintenance disabled. The procedure below documents the transfer for future reference; the original Render database has not been deleted.

1. Create an empty Neon Free project using PostgreSQL 18, preferably in Frankfurt, and test the migrations on an isolated Neon branch.
2. Push the updated source and `render.yaml`. The Blueprint changes `DATABASE_URL` to a manually managed secret. Its existing value is preserved.
3. Set `BOOKING_MAINTENANCE=true` in Render and deploy. **Wait for this deployment to become live before the transfer.** New bookings now receive HTTP 503 while the site remains readable.
4. Keep `DATABASE_URL` pointing to the original Render database. Set `NEON_DATABASE_URL` to a **direct**, TLS-enabled Neon connection string, then set `TRANSFER_TO_NEON=true` and deploy. The application initializes the destination, copies services and bookings in a transaction, and compares every stored field. It keeps UUIDs, dates, contact details, original prices and timestamp microseconds. The source is read in a read-only transaction and is never modified.
5. Verify the migration summary and destination data through Neon. The transfer refuses an unrecognized destination containing bookings and rolls back if verification fails. A completion record prevents duplicate transfers on restarts.
6. Set `DATABASE_URL` to the verified Neon URL, clear `NEON_DATABASE_URL`, and set `TRANSFER_TO_NEON=false` and `BOOKING_MAINTENANCE=false`. Deploy again and verify services, availability, booking and conflict handling. Never commit database URLs or log customer data.
7. Keep the original Render database as a temporary rollback copy. If a transfer fails before bookings resume, restore `DATABASE_URL` to the original source, clear `NEON_DATABASE_URL`, disable transfer mode and maintenance, then deploy. Once bookings resume on Neon, migrate any new records before considering a rollback.

This server-side transfer can read the original database over Render's private network. It does not need to open the source database's public firewall. An alternative is `pg_dump` / `pg_restore`, using direct connections and a temporary rule allowing only the operator's IP.

The app already supports an external Postgres connection string. Its migrations and seed data are repeatable, so starting it against the restored database preserves existing bookings and service prices. Local development continues to use Docker on port 5433.

Render's free web service can sleep when inactive. The live app uses [Neon Free](https://neon.com/pricing), which has usage limits and no fixed trial expiration. The old Render database still expires after 30 days, but the live application no longer depends on it.

## API

| Method | Path                                                  | Purpose                     |
| ------ | ----------------------------------------------------- | --------------------------- |
| GET    | `/api/health`                                         | Server health               |
| GET    | `/api/services`                                       | Services from PostgreSQL    |
| GET    | `/api/availability?serviceId=haircut&date=YYYY-MM-DD` | Available times             |
| POST   | `/api/bookings`                                       | Validate and save a booking |

The original `/health`, `/services`, `/availability` and `/bookings` paths remain available for local learning exercises.

## Current scope

This is a learning demo for one barber. Appointments are test data. Customer-linked bookings, protected dashboards, roles, cancellation, payments, and appointment confirmation emails are still to be added. The account interface is being developed separately from the deployed booking flow.

Availability refreshes when the service or date changes and after a successful booking. The selected time is cleared after booking, while the confirmation remains visible until a new selection is made. If another user books a time in the meantime, the database rejects the conflicting submission with HTTP 409.

An inline calendar disables past dates and Sundays. Closed days are also rejected by the API. The calendar and available times appear side by side on larger screens and stack vertically on mobile.

## Checks

```bash
npm run lint --prefix frontend
npm run build --prefix frontend
npm test --prefix backend
```

The availability tests cover closed Sundays, open weekdays, overlap, adjacent appointments, elapsed times, future dates, and closing time. The transfer tests cover preservation, repeated runs, destination protection, verification failures, and transaction cleanup. These tests do not contact Neon or write to a real database. Browser layout and authentication flows still need manual checks.
