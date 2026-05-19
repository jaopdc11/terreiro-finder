import { test, expect } from '@playwright/test';
import { removerUsuariosPorEmailPrefix } from './fixtures/auth-helpers';

const PREFIX = 'e2e-auth+';

function emailUnico(): string {
  return `${PREFIX}${Date.now()}-${Math.floor(Math.random() * 1e6)}@test.local`;
}

test.describe('auth', () => {
  test.beforeAll(async () => {
    await removerUsuariosPorEmailPrefix(PREFIX);
  });

  test.afterAll(async () => {
    await removerUsuariosPorEmailPrefix(PREFIX);
  });

  // Pula o wizard de onboarding em todos os testes deste arquivo.
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      localStorage.setItem(
        'encruza.onboarding',
        JSON.stringify({ state: { passo: 0, bifurcacao: null, concluido: true }, version: 0 }),
      );
    });
  });

  test('cadastro → logado → logout', async ({ page }) => {
    await page.goto('/cadastro');
    await expect(page).toHaveURL(/\/cadastro$/);

    const main = page.getByRole('main');
    const email = emailUnico();
    await main.getByLabel('Nome completo').fill('Tester E2E');
    await main.getByLabel('Email').fill(email);
    await main.getByLabel('Senha', { exact: true }).fill('senhaforte');
    await main.getByLabel('Confirmar senha').fill('senhaforte');
    await main.getByRole('button', { name: /Criar conta/i }).click();

    await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });
    await expect(page.getByRole('button', { name: 'Sair' })).toBeVisible();

    await page.getByRole('button', { name: 'Sair' }).click();
    await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible();
  });

  test('login com credenciais erradas mostra erro', async ({ page }) => {
    await page.goto('/login');
    const main = page.getByRole('main');
    await main.getByLabel('Email').fill('inexistente@test.local');
    await main.getByLabel('Senha', { exact: true }).fill('senhaerrada');
    await main.getByRole('button', { name: 'Entrar' }).click();
    await expect(main.getByRole('alert')).toBeVisible();
  });
});
