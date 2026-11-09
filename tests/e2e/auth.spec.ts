import { test, expect } from './fixtures/test';
import { bancoE2E, linkDoEmail, removerUsuariosPorEmailPrefix } from './fixtures/banco';

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

  test('cadastro → confira o e-mail → link confirma e já entra → logout', async ({ page }) => {
    await page.goto('/cadastro');
    await expect(page).toHaveURL(/\/cadastro$/);

    const main = page.getByRole('main');
    const email = emailUnico();
    await main.getByLabel('Nome completo').fill('Tester E2E');
    await main.getByLabel('Email').fill(email);
    await main.getByLabel('Senha', { exact: true }).fill('senhaforte');
    await main.getByLabel('Confirmar senha').fill('senhaforte');
    await main.getByRole('button', { name: /Criar conta/i }).click();

    // Conta só entra depois de confirmar o e-mail.
    await expect(page.getByTestId('cadastro-confira-email')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sair' })).toHaveCount(0);

    // Em teste a API registra o e-mail no log; o link aponta pro front.
    const link = new URL(await linkDoEmail(email));
    await page.goto(`${link.pathname}${link.search}`);
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

  test('login sem confirmar oferece reenviar o link', async ({ page }) => {
    const email = emailUnico();
    await bancoE2E().criarUsuario({ email, senha: 'senhaforte', confirmado: false });
    await page.goto('/login');
    const main = page.getByRole('main');
    await main.getByLabel('Email').fill(email);
    await main.getByLabel('Senha', { exact: true }).fill('senhaforte');
    await main.getByRole('button', { name: 'Entrar' }).click();
    await expect(main.getByRole('alert')).toContainText(/Confirme seu e-mail/i);
    await main.getByRole('button', { name: /Reenviar link de confirmação/i }).click();
    await expect(page.getByTestId('confirmacao-reenviada')).toBeVisible();
    expect(await linkDoEmail(email)).toContain('/confirmar-email?token=');
  });

  test('esqueci a senha → link → senha nova entra', async ({ page }) => {
    const email = emailUnico();
    await bancoE2E().criarUsuario({ email, senha: 'senha-antiga-1' });
    await page.goto('/recuperar-senha');
    await page.getByLabel('Email').fill(email);
    await page.getByRole('button', { name: /Enviar link/i }).click();
    await expect(page.getByText(/Email enviado/i)).toBeVisible();

    const link = new URL(await linkDoEmail(email));
    await page.goto(`${link.pathname}${link.search}`);
    await page.getByLabel('Senha nova').fill('senha-nova-123');
    await page.getByLabel('Repita a senha').fill('senha-nova-123');
    await page.getByRole('button', { name: /Salvar senha/i }).click();
    await expect(page.getByRole('heading', { name: 'Senha trocada.' })).toBeVisible();

    await page.goto('/login');
    const main = page.getByRole('main');
    await main.getByLabel('Email').fill(email);
    await main.getByLabel('Senha', { exact: true }).fill('senha-nova-123');
    await main.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByRole('button', { name: 'Sair' })).toBeVisible({ timeout: 15_000 });
  });
});
