import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('smoke', () => {
  test('home renderiza com paleta e fontes aplicadas', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/terreiros/i);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const bg = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor,
    );
    // Background não pode ser branco padrão — paleta Terra/Pemba aplicada.
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    expect(bg).not.toBe('rgb(255, 255, 255)');

    const h1Font = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? getComputedStyle(h1).fontFamily : '';
    });
    expect(h1Font.toLowerCase()).toContain('fraunces');
  });

  test('home não tem violação a11y bloqueante', async ({ page }) => {
    await page.goto('/');
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(result.violations).toEqual([]);
  });
});
