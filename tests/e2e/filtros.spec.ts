import { test, expect } from './fixtures/test';

test.describe('filtros', () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      localStorage.setItem(
        'encruza.onboarding',
        JSON.stringify({ state: { passo: 0, bifurcacao: null, concluido: true }, version: 0 }),
      );
    });
  });

  test('chip de tradição reflete na URL e reduz contagem', async ({ page }) => {
    await page.goto('/');

    const botaoLista = page.getByRole('button', { name: /Ver em lista/ });
    const inicial = (await botaoLista.textContent()) ?? '';

    await page.getByRole('button', { name: 'Candomblé', exact: true }).click();
    await expect(page).toHaveURL(/tradicao=candomble/);

    // Após filtrar por candomblé, a contagem deve ter mudado.
    await expect(botaoLista).not.toHaveText(inicial);
  });

  test('overlay "Mais filtros" mostra linhas-de-umbanda quando tradição=umbanda', async ({
    page,
  }) => {
    await page.goto('/?tradicao=umbanda');
    await page.getByRole('button', { name: 'Mais filtros' }).click();

    const dialog = page.getByRole('dialog', { name: /Mais filtros/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Linhas trabalhadas')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'caboclo' })).toBeVisible();
  });

  test('escolher tag umbanda filtra resultado', async ({ page }) => {
    await page.goto('/?tradicao=umbanda');
    await page.getByRole('button', { name: 'Mais filtros' }).click();
    const dialog = page.getByRole('dialog', { name: /Mais filtros/ });
    await dialog.getByRole('button', { name: 'caboclo' }).click();
    await dialog.getByRole('button', { name: 'Ver resultados' }).click();
    await expect(page).toHaveURL(/tags=caboclo/);
  });

  test('botão limpar zera os filtros e a URL', async ({ page }) => {
    await page.goto('/?tradicao=umbanda&cidade=Itaja%C3%AD');
    await page.getByRole('button', { name: 'Limpar' }).click();
    await expect(page).toHaveURL(/^http:\/\/[^/]+\/$/);
  });
});
