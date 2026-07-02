import { z } from 'zod';

// Validate public env vars at startup — fail fast if misconfigured.
// Only VITE_* is exposed to the browser; NEVER put secrets here (they'd ship
// to the client). Server-only secrets belong in a backend, not in a Vite app.
const schema = z.object({
  VITE_API_URL: z.string().url().optional(),
});

export const env = schema.parse(import.meta.env);
