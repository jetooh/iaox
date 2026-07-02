import { test, expect } from '@playwright/test';
import path from 'node:path';

// E2E: open the app, assert the welcome UI, and save a screenshot into the
// orchestrator's ROOT screenshot/ folder (auto-cleaned every 12h).
test('home page renders and captures a screenshot', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /bem-vindo/i })).toBeVisible();

  // process.cwd() is the app dir (app/<app>); the root screenshot/ is two levels up.
  const screenshotDir = path.resolve(process.cwd(), '../../screenshot');
  await page.screenshot({ path: path.join(screenshotDir, '__APP_NAME__-home.png'), fullPage: true });
});
