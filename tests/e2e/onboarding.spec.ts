import { test, expect } from './fixtures/test';

test.describe('onboarding', () => {
  test('exibe wizard em 3 passos e finaliza levando pra rota correta', async ({ page }) => {
    await page.goto('/');

    const dialog = page.getByTestId('onboarding');
    await expect(dialog).toBeVisible();

    // Passo 1
    await expect(page.getByText('Passo 1 de 3')).toBeVisible();
    await dialog.getByRole('button', { name: 'Bora' }).click();

    // Passo 2: escolher bifurcação
    await expect(page.getByText('Passo 2 de 3')).toBeVisible();
    await dialog.getByRole('button', { name: 'Procuro uma casa' }).click();
    await dialog.getByRole('button', { name: 'Avançar' }).click();

    // Passo 3
    await expect(page.getByText('Passo 3 de 3')).toBeVisible();
    await dialog.getByRole('button', { name: 'Procurar casa' }).click();

    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/$/);
  });

  test('botão Pular fecha sem escolher bifurcação', async ({ page }) => {
    await page.goto('/');
    const dialog = page.getByTestId('onboarding');
    await dialog.getByRole('button', { name: 'Pular' }).click();
    await expect(dialog).toBeHidden();
  });

  test('persistência: não reaparece após reload', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('onboarding').getByRole('button', { name: 'Pular' }).click();
    await page.reload();
    await expect(page.getByTestId('onboarding')).toBeHidden();
  });
});
