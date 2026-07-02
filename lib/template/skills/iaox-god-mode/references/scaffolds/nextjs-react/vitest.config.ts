/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    // Unit tests live next to the code (app/**, src/**); e2e/ is Playwright's.
    include: ['app/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    // Transpile workspace packages (@ecosystem/*, TS source) when used in tests.
    server: { deps: { inline: [/@ecosystem\//] } },
  },
});
