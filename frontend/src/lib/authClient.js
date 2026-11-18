// ─── Imports ─────────────────────────────────────────────────────────

import { createAuthClient } from '@neon/auth';
import { BetterAuthReactAdapter } from '@neon/auth/react/adapters';

// ─── Auth client ─────────────────────────────────────────────────────

export const authClient = createAuthClient(import.meta.env.VITE_NEON_AUTH_URL, {
  adapter: BetterAuthReactAdapter(),
});
