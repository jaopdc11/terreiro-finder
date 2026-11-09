import { test, expect } from './fixtures/test';

test.describe('pin de casa não verificada', () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      localStorage.setItem(
        'encruza.onboarding',
        JSON.stringify({ state: { passo: 0, bifurcacao: null, concluido: true }, version: 0 }),
      );
    });
  });

  test('mapa renderiza pin com classe "pin-nao-verificada" pra casa indicada', async ({ page }) => {
    await page.goto('/');
    // Aguarda os pins aparecerem.
    await page.waitForSelector('.leaflet-marker-icon');
    const naoVerif = page.locator('.pin-nao-verificada');
    // Pelo menos 1 — o seed garante. Outros dados de dev podem somar mais.
    await expect.poll(() => naoVerif.count()).toBeGreaterThanOrEqual(1);
  });

  test('ficha de casa não-verificada destaca o aviso no topo', async ({ page }) => {
    await page.goto('/casa/seed-casa-indicada');
    const aviso = page.getByText(/Casa indicada — não verificada/i).first();
    await expect(aviso).toBeVisible();
    await expect(page.getByRole('link', { name: /Reivindique aqui/i })).toBeVisible();
  });
});
