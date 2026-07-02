/**
 * SYSTIC-CI — Configuration Playwright E2E
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',

  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Setup : auth
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    // Tests authentifiés (dépendent du setup)
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Tests non-authentifiés (pages publiques)
    {
      name: 'unauthenticated',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*\.public\.spec\.ts/,
    },

    // Mobile
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        storageState: './e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  // Démarrer le serveur Next.js pour les tests
  webServer: {
    command: 'npm run dev --prefix apps/web',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
