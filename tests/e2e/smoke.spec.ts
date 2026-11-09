import { test, expect } from './fixtures/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('smoke', () => {
  test('home renderiza com paleta e fontes aplicadas', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/encruza/i);

    const bg = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor,
    );
    // Background não pode ser branco padrão — paleta Terra/Pemba aplicada.
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    expect(bg).not.toBe('rgb(255, 255, 255)');

    // Logo "Encruza" presente no header.
    const logoText = await page.evaluate(() => {
      const el = document.querySelector('header a[href="/"]');
      return el ? el.textContent?.trim() ?? '' : '';
    });
    expect(logoText).toContain('Encruza');
  });

  test('rota /sobre não tem violação a11y bloqueante', async ({ page }) => {
    // a11y do mapa (botões internos do Leaflet sem aria-label) é débito de
    // Fase 5 — polimento. /sobre é uma página simples que cobre layout, header
    // e tipografia sem o iframe-do-Leaflet por baixo.
    await page.goto('/sobre');
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(result.violations).toEqual([]);
  });
});
