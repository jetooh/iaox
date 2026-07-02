import { defineConfig } from '@playwright/test';

// E2E config. Specs write screenshots into the orchestrator's root screenshot/
// folder (auto-cleaned every 12h) — see e2e/home.spec.ts.
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:__PORT__',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:__PORT__',
    reuseExistingServer: true,
  },
});
