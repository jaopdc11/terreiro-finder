import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Spec a11y abrangente — varre as páginas públicas com axe-core (WCAG 2.1 AA).
 *
 * Estratégia:
 *   - Onboarding é dispensado via localStorage pra remover overlay de cima.
 *   - O mapa Leaflet é excluído do scan: a a11y dos controles internos
 *     já é coberta pelo ZoomA11y (componente nosso), e o resto é canvas de
 *     tiles — axe não tem o que avaliar.
 *
 * Páginas anônimas testadas: home (com mapa), sobre, política, login, cadastro,
 * recuperar-senha, ficha pública de casa.
 */
async function preparar(page: Page, url: string) {
  await page.addInitScript(() => {
    localStorage.setItem(
      'encruza.onboarding',
      JSON.stringify({
        state: { passo: 0, bifurcacao: null, concluido: true },
        version: 0,
      }),
    );
  });
  await page.goto(url);
}

async function escanear(page: Page) {
  const r = await new AxeBuilder({ page })
    .exclude('.leaflet-container')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  return r.violations;
}

test.describe('a11y · páginas públicas (WCAG AA)', () => {
  test('home (busca com mapa)', async ({ page }) => {
    await preparar(page, '/');
    await page.waitForLoadState('networkidle');
    expect(await escanear(page)).toEqual([]);
  });

  test('política de privacidade', async ({ page }) => {
    await preparar(page, '/politica');
    expect(await escanear(page)).toEqual([]);
  });

  test('login', async ({ page }) => {
    await preparar(page, '/login');
    expect(await escanear(page)).toEqual([]);
  });

  test('cadastro de conta', async ({ page }) => {
    await preparar(page, '/cadastro');
    expect(await escanear(page)).toEqual([]);
  });

  test('recuperar senha', async ({ page }) => {
    await preparar(page, '/recuperar-senha');
    expect(await escanear(page)).toEqual([]);
  });
});
