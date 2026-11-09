import { defineConfig, devices } from '@playwright/test';
import { API_E2E, ORIGEM_E2E, PORTA_FRONT_E2E } from './tests/e2e/ambiente';

const baseURL = ORIGEM_E2E;

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/e2e/global-setup.ts',
  // Specs compartilham um único Postgres (container do global-setup) — paralelismo entre specs
  // cria condições de corrida em seed e cleanup (auth.spec, indicacao-moderacao
  // mexem em users; sem isolamento por schema, um worker pisa no outro).
  // Mantemos `fullyParallel` dentro do spec (Playwright ainda paraleliza testes
  // dentro de um describe), mas com 1 worker o suite roda determinístico.
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [['html'], ['github']] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-mobile',
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: `pnpm build && pnpm preview --port ${PORTA_FRONT_E2E} --strictPort`,
    env: { VITE_API_URL: API_E2E },
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
