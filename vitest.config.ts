import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    projects: [
      {
        plugins: [react()],
        resolve: {
          alias: { '@': path.resolve(__dirname, 'src') },
        },
        test: {
          name: 'unit',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./tests/setup/setup-jsdom.ts'],
          include: [
            'src/**/*.spec.{ts,tsx}',
            'tests/unit/**/*.spec.{ts,tsx}',
          ],
        },
      },
      {
        resolve: {
          alias: { '@': path.resolve(__dirname, 'src') },
        },
        test: {
          name: 'integration',
          environment: 'node',
          globals: true,
          // Sobe Postgres 17 (docker) + encruza-api reais; ver tests/setup/ambienteApi.ts.
          globalSetup: ['./tests/setup/globalSetup-integration.ts'],
          include: ['tests/integration/**/*.spec.ts'],
          testTimeout: 20_000,
          hookTimeout: 180_000,
          // Um banco só: arquivos em sequência num processo (cada um limpa no começo).
          pool: 'forks',
          poolOptions: { forks: { singleFork: true } },
          sequence: { concurrent: false },
        },
      },
    ],
  },
});
