// ─── Imports ─────────────────────────────────────────────────────────

import { Router } from 'express';
import { getAvailability } from '../controllers/availabilityController.js';

// ─── Router setup ────────────────────────────────────────────────────

const router = Router();

// ─── Availability routes ─────────────────────────────────────────────

router.get('/', getAvailability);

export default router;
