// ─── Imports ────────────────────────────────────────────────────────────
import { Router } from 'express';
import { createBooking } from '../controllers/bookingController.js';

// ─── Router setup ──────────────────────────────────────────────────────
const router = Router();

// ─── Booking routes ────────────────────────────────────────────────────
router.post('/', createBooking);

export default router;
