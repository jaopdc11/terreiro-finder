import { test, expect } from '@playwright/test';
import { adminClient, removerUsuariosPorEmailPrefix } from './fixtures/auth-helpers';

const PREFIX = 'e2e-cad+';
const EMAIL_DIR = `${PREFIX}dirigente@test.local`;
const EMAIL_ADM = `${PREFIX}admin@test.local`;
const SENHA = 'senhaforte';

const NOME_CASA = `Casa Cadastro E2E ${Date.now()}`;

test.describe('cadastro direto pela dirigência', () => {
  test.beforeAll(async () => {
    const admin = adminClient();
    await removerUsuariosPorEmailPrefix(PREFIX);
    // Limpa qualquer resíduo do test rodado antes
    await admin.from('casas').delete().like('nome', '%Casa Cadastro E2E%');

    await admin.auth.admin.createUser({
      email: EMAIL_DIR,
      password: SENHA,
      email_confirm: true,
      user_metadata: { nome_completo: 'Dirigente Cadastro E2E' },
    });
    const { data: adm } = await admin.auth.admin.createUser({
      email: EMAIL_ADM,
      password: SENHA,
      email_confirm: true,
      user_metadata: { nome_completo: 'Admin Cadastro E2E' },
    });
    if (adm.user) {
      await admin.from('profiles').update({ role: 'admin' }).eq('id', adm.user.id);
    }
  });

  test.afterAll(async () => {
    const admin = adminClient();
    await admin.from('casas').delete().like('nome', '%Casa Cadastro E2E%');
    await removerUsuariosPorEmailPrefix(PREFIX);
  });

  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      localStorage.setItem(
        'terreiros.onboarding',
        JSON.stringify({ state: { passo: 0, bifurcacao: null, concluido: true }, version: 0 }),
      );
    });
  });

  test('dirigente preenche wizard → admin aprova → casa nasce verificada e dirigente vê no painel', async ({
    browser,
  }) => {
    // === Dirigente loga e abre wizard ===
    const cDir = await browser.newContext();
    await cDir.addInitScript(() => {
      localStorage.setItem(
        'terreiros.onboarding',
        JSON.stringify({ state: { passo: 0, bifurcacao: null, concluido: true }, version: 0 }),
      );
    });
    const pDir = await cDir.newPage();
    await pDir.goto('/login');
    await pDir.getByRole('main').getByLabel('Email').fill(EMAIL_DIR);
    await pDir.getByRole('main').getByLabel('Senha', { exact: true }).fill(SENHA);
    await pDir.getByRole('main').getByRole('button', { name: 'Entrar' }).click();
    await expect(pDir).toHaveURL(/\/$/);

    await pDir.goto('/cadastrar');
    await expect(
      pDir.getByRole('heading', { level: 1, name: /Cadastrar minha casa/i }),
    ).toBeVisible();

    // Passo 1 — identidade
    const main = pDir.getByRole('main');
    await main.getByLabel('Nome da casa').fill(NOME_CASA);
    await main.getByLabel('Tradição principal').selectOption('umbanda');
    await main
      .getByLabel(/Como podemos validar/i)
      .fill('Instagram da casa @cadastro-e2e — DM pra Mãe Tester');
    await main.getByRole('button', { name: 'Próximo' }).click();

    // Passo 2 — endereço
    await main.getByLabel('Bairro').fill('Centro');
    // Cidade/Estado default Itajaí/SC
    await main.getByRole('button', { name: 'Próximo' }).click();

    // Passo 3 — abertura + contato (precisa pelo menos um canal)
    await main.getByLabel('WhatsApp').fill('47999000111');
    await main.getByRole('button', { name: /Enviar cadastro/i }).click();

    await expect(
      pDir.getByRole('heading', { name: /Cadastro recebido/i }),
    ).toBeVisible({ timeout: 10_000 });
    await cDir.close();

    // === Admin loga, abre /admin → aba "Cadastros novos" → aprova ===
    const cAdm = await browser.newContext();
    await cAdm.addInitScript(() => {
      localStorage.setItem(
        'terreiros.onboarding',
        JSON.stringify({ state: { passo: 0, bifurcacao: null, concluido: true }, version: 0 }),
      );
    });
    const pAdm = await cAdm.newPage();
    await pAdm.goto('/login');
    await pAdm.getByRole('main').getByLabel('Email').fill(EMAIL_ADM);
    await pAdm.getByRole('main').getByLabel('Senha', { exact: true }).fill(SENHA);
    await pAdm.getByRole('main').getByRole('button', { name: 'Entrar' }).click();
    await expect(pAdm).toHaveURL(/\/$/);

    await pAdm.goto('/admin');
    await pAdm.getByRole('tab', { name: 'Cadastros novos' }).click();
    const lista = pAdm.getByTestId('lista-cadastros-pendentes');
    await expect(lista).toBeVisible();
    const item = lista.getByRole('listitem').filter({ hasText: NOME_CASA });
    await expect(item).toBeVisible();
    // Admin vê o canal de validação destacado
    await expect(item.getByText(/Instagram da casa @cadastro-e2e/i)).toBeVisible();
    await item.getByRole('button', { name: /Validei dirigência/ }).click();
    await expect(item).toBeHidden({ timeout: 10_000 });
    await cAdm.close();

    // === Dirigente reabre /painel e vê a casa publicada ===
    const cDir2 = await browser.newContext();
    await cDir2.addInitScript(() => {
      localStorage.setItem(
        'terreiros.onboarding',
        JSON.stringify({ state: { passo: 0, bifurcacao: null, concluido: true }, version: 0 }),
      );
    });
    const pDir2 = await cDir2.newPage();
    await pDir2.goto('/login');
    await pDir2.getByRole('main').getByLabel('Email').fill(EMAIL_DIR);
    await pDir2.getByRole('main').getByLabel('Senha', { exact: true }).fill(SENHA);
    await pDir2.getByRole('main').getByRole('button', { name: 'Entrar' }).click();
    await expect(pDir2).toHaveURL(/\/$/);

    await pDir2.goto('/painel');
    await expect(pDir2.getByRole('button', { name: new RegExp(NOME_CASA) })).toBeVisible();
    await cDir2.close();

    // === Anônimo abre ficha pública: aparece SEM aviso "não verificada" ===
    const cAnon = await browser.newContext();
    await cAnon.addInitScript(() => {
      localStorage.setItem(
        'terreiros.onboarding',
        JSON.stringify({ state: { passo: 0, bifurcacao: null, concluido: true }, version: 0 }),
      );
    });
    const pAnon = await cAnon.newPage();
    // Espera 1s pra cache REST do PostgREST atualizar; nem sempre necessário.
    await pAnon.waitForTimeout(500);
    await pAnon.goto('/');
    await pAnon.getByRole('button', { name: /Ver em lista/ }).click();
    const dialog = pAnon.getByRole('dialog', { name: /Casas/ });
    await expect(dialog.getByText(NOME_CASA)).toBeVisible();
    // Não deve ter o aviso de não-verificada pra essa casa (fonte=proprio + aprovada).
    const linha = dialog
      .getByRole('listitem')
      .filter({ hasText: NOME_CASA });
    await expect(linha.getByText(/não verificada/i)).toHaveCount(0);
    await cAnon.close();
  });
});
