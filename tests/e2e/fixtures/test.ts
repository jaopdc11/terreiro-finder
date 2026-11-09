import { test as base, expect } from '@playwright/test';
import { API_E2E } from '../ambiente';

/**
 * `test` dos e2e: cada teste sai com um IP falso (X-Forwarded-For) nas
 * chamadas à API, pra o rate limit por IP (login, e-mail) não acumular entre
 * testes — todos rodam do mesmo 127.0.0.1. Vai por `route` (no nível da
 * rede) e não por extraHTTPHeaders, que dispara preflight de CORS em tudo.
 */
export const test = base.extend<{ ipFalso: void }>({
  ipFalso: [
    async ({ context }, usar) => {
      const n = () => Math.floor(Math.random() * 250) + 1;
      const ip = `10.${n()}.${n()}.${n()}`;
      await context.route(`${API_E2E}/**`, (rota) =>
        rota.continue({ headers: { ...rota.request().headers(), 'x-forwarded-for': ip } }),
      );
      await usar();
    },
    { auto: true },
  ],
});

export { expect };
export type { Page } from '@playwright/test';
