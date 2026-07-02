import { z } from 'zod';

// Validate env at startup — fail fast if misconfigured. In Next.js, only
// NEXT_PUBLIC_* is exposed to the browser; keep secrets without that prefix
// (server-only). Access env through this typed object, not process.env directly.
const schema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
});

export const env = schema.parse(process.env);
