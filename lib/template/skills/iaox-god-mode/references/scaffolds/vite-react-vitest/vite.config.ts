/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    // Unit tests live in src/; e2e/ is Playwright's territory.
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
