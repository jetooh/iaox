/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Unique port per app in the ecosystem (assigned from ecosystem.json).
  server: { port: __PORT__ },
  test: {
    environment: 'jsdom',
    globals: true,
    // Unit tests live in src/; e2e/ is Playwright's territory.
    include: ['src/**/*.test.{ts,tsx}'],
    // Transpile workspace packages (@ecosystem/*, TS source) when used in tests.
    server: { deps: { inline: [/@ecosystem\//] } },
  },
});
