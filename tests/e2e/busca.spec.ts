import { test, expect } from './fixtures/test';

test.describe('busca', () => {
  test.beforeEach(async ({ context }) => {
    // Pula onboarding pra não bloquear cliques no mapa.
    await context.addInitScript(() => {
      localStorage.setItem(
        'encruza.onboarding',
        JSON.stringify({ state: { passo: 0, bifurcacao: null, concluido: true }, version: 0 }),
      );
    });
  });

  test('home carrega mapa + chips + botão "Ver em lista" com contagem', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('mapa-container')).toBeVisible();
    await expect(page.getByRole('button', { name: /Ver em lista/ })).toBeVisible();
    // Esperamos ao menos 3 casas aprovadas no seed (umbanda, candomble, indicada-aprovada).
    await expect(page.getByRole('button', { name: /Ver em lista \([3-9]/ })).toBeVisible();
  });

  test('lista mostra casas e link pra ficha', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Ver em lista/ }).click();
    const dialog = page.getByRole('dialog', { name: /Casas/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('link').first()).toBeVisible();
  });

  test('ficha pública abre via slug e mostra dados da casa', async ({ page }) => {
    await page.goto('/casa/seed-tenda-pai-joao');
    await expect(page.getByRole('heading', { level: 1, name: /Tenda Pai João/ })).toBeVisible();
    await expect(page.getByText(/com Pai João/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Como visitar' })).toBeVisible();
  });

  test('slug inexistente mostra página de "não encontrada"', async ({ page }) => {
    await page.goto('/casa/nao-existe');
    await expect(page.getByRole('heading', { name: /não encontrada/i })).toBeVisible();
  });
});
