// ─── Imports ─────────────────────────────────────────────────────────

import { Router } from 'express';
import { getServices } from '../controllers/serviceController.js';

// ─── Router setup ────────────────────────────────────────────────────

const router = Router();

// ─── Service routes ──────────────────────────────────────────────────

router.get('/', getServices);

export default router;
