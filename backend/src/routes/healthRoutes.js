// ─── Imports ─────────────────────────────────────────────────────────

import { Router } from 'express';

// ─── Router setup ────────────────────────────────────────────────────

const router = Router();

// ─── Health check ────────────────────────────────────────────────────

router.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

export default router;
