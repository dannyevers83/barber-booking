// ─── Imports ─────────────────────────────────────────────────────────

import { fileURLToPath } from 'node:url';

import express from 'express';

import healthRoutes from './routes/healthRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import availabilityRoutes from './routes/availabilityRoutes.js';

// ─── App setup ───────────────────────────────────────────────────────

const app = express();

// ─── JSON middleware ─────────────────────────────────────────────────

app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

// ─── Routes ──────────────────────────────────────────────────────────

app.use('/health', healthRoutes);
app.use('/services', serviceRoutes);
app.use('/bookings', bookingRoutes);
app.use('/availability', availabilityRoutes);

// ─── Same-origin API for the deployed frontend ───────────────────────

const api = express.Router();
api.use('/health', healthRoutes);
api.use('/services', serviceRoutes);
api.use('/bookings', bookingRoutes);
api.use('/availability', availabilityRoutes);
api.use((req, res) =>
  res.status(404).json({ error: 'API endpoint not found.' }),
);
app.use('/api', api);

// ─── Production frontend ─────────────────────────────────────────────

if (process.env.NODE_ENV === 'production') {
  const frontendPath = fileURLToPath(
    new URL('../../frontend/dist/', import.meta.url),
  );
  app.use(express.static(frontendPath));
  app.get('/{*path}', (req, res) => res.sendFile(`${frontendPath}index.html`));
}

// ─── JSON error responses ────────────────────────────────────────────

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status =
    error.type === 'entity.parse.failed'
      ? 400
      : error.type === 'entity.too.large'
        ? 413
        : 500;
  res.status(status).json({
    error:
      status === 400
        ? 'Please send valid JSON.'
        : status === 413
          ? 'Request is too large.'
          : 'Unable to process your request.',
  });
});

export default app;
