import { defineConfig, devices } from '@playwright/test';
import { config as loadEnv } from 'dotenv';
import path from 'node:path';

// Carrega .env.test no processo do runner pra fixtures admin (auth-helpers)
// terem SUPABASE_URL / SERVICE_ROLE_KEY disponíveis.
loadEnv({ path: path.resolve(process.cwd(), '.env.test') });

const PORT = 4173;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',
  // Specs compartilham um único Postgres local — paralelismo entre specs
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
    command: 'pnpm build && pnpm preview --port 4173 --strictPort',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
