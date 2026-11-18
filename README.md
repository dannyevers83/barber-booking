# Oak & Steel Barbers

A full-stack barber booking demo built with React, Vite, Tailwind CSS, Express and PostgreSQL.

Customers can select a service, choose an available time and submit their contact details. Bookings are saved in PostgreSQL. A database exclusion constraint prevents overlapping appointments for the single demo barber, including concurrent booking requests.

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

Push this repository to GitHub and create a Render Blueprint using the root `render.yaml`. It defines one free Node web service and one free PostgreSQL 18 database in Frankfurt.

The build installs both applications and builds the frontend. Express serves the built frontend and `/api` endpoints from the same domain. Render supplies `DATABASE_URL`; local passwords and test bookings are not uploaded. Before listening for requests, the server runs migrations and inserts the four starting services. Startup fails if initialization fails.

Render's free web service can sleep when inactive. Free Render PostgreSQL databases expire after 30 days. Review the current [free instance limits](https://render.com/docs/free) before publishing; this configuration is intended for a temporary demo.

## API

| Method | Path                                                  | Purpose                     |
| ------ | ----------------------------------------------------- | --------------------------- |
| GET    | `/api/health`                                         | Server health               |
| GET    | `/api/services`                                       | Services from PostgreSQL    |
| GET    | `/api/availability?serviceId=haircut&date=YYYY-MM-DD` | Available times             |
| POST   | `/api/bookings`                                       | Validate and save a booking |

The original `/health`, `/services`, `/availability` and `/bookings` paths remain available for local learning exercises.

## Current scope

This is a learning demo for one barber. Appointments are test data. Accounts, cancellation, owner dashboards, payments, email confirmations, closed days and filtering out elapsed times today are still to be added. Availability is loaded when the service or date changes; if another user books a time in the meantime, the database rejects the conflicting submission with HTTP 409.

## Checks

```bash
npm run lint --prefix frontend
npm run build --prefix frontend
```
