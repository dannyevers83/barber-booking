# Oak & Steel Barbers

A full-stack barber booking demo built with React, Vite, Tailwind CSS, Express and PostgreSQL.

Customers can select a service, choose an available time and submit their contact details. Bookings are saved in PostgreSQL. A database exclusion constraint prevents overlapping appointments for the single demo barber, including concurrent booking requests.

Elapsed appointment times are hidden for the current day and rejected when submitting a booking. Date and time checks use the Europe/Amsterdam time zone.

## Project structure

```text
frontend/       React interface and API clients
backend/        Express API, validation, models and SQL migrations
compose.yaml    Local PostgreSQL 18 database
render.yaml     Online demo web service and database
```

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

This is a learning demo for one barber. Appointments are test data. Accounts, cancellation, owner dashboards, payments, email confirmations, and closed days are still to be added. Availability is loaded when the service or date changes; if another user books a time in the meantime, the database rejects the conflicting submission with HTTP 409.

## Checks

```bash
npm run lint --prefix frontend
npm run build --prefix frontend
npm test --prefix backend
```
