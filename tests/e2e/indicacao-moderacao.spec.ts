import { test, expect } from '@playwright/test';
import { adminClient, removerUsuariosPorEmailPrefix } from './fixtures/auth-helpers';

const PREFIX = 'e2e-mod+';
const ADMIN_EMAIL = `${PREFIX}admin@test.local`;
const VISITANTE_EMAIL = `${PREFIX}visitante@test.local`;
const SENHA = 'senhaforte';

const NOME_CASA = `Casa Indicada E2E ${Date.now()}`;

test.describe('indicação + moderação em 2 passos', () => {
  test.beforeAll(async () => {
    const admin = adminClient();
    await removerUsuariosPorEmailPrefix(PREFIX);
    await admin.from('casas').delete().like('nome', '%E2E %');
    await admin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: SENHA,
      email_confirm: true,
      user_metadata: { nome_completo: 'Admin E2E' },
    });
    await admin.auth.admin.createUser({
      email: VISITANTE_EMAIL,
      password: SENHA,
      email_confirm: true,
      user_metadata: { nome_completo: 'Visitante E2E' },
    });
    // Promove o primeiro user a admin.
    const { data: users } = await admin.auth.admin.listUsers({ page: 1, perPage: 100 });
    const adminUser = users.users.find((u) => u.email === ADMIN_EMAIL);
    if (adminUser) {
      await admin.from('profiles').update({ role: 'admin' }).eq('id', adminUser.id);
    }
  });

  test.afterAll(async () => {
    const admin = adminClient();
    await admin.from('casas').delete().like('nome', '%E2E %');
    await admin.from('indicacoes_casa').delete().like('nome', '%E2E %');
    await removerUsuariosPorEmailPrefix(PREFIX);
  });

  // Init script aplicado em cada contexto novo que o teste criar.
  const pularOnboarding = (ctx: import('@playwright/test').BrowserContext) =>
    ctx.addInitScript(() => {
      localStorage.setItem(
        'terreiros.onboarding',
        JSON.stringify({ state: { passo: 0, bifurcacao: null, concluido: true }, version: 0 }),
      );
    });

  test('fluxo: visitante indica → admin valida → admin confirma → casa aparece como não-verificada', async ({
    browser,
  }) => {
    // 1) Visitante indica
    const ctxVis = await browser.newContext();
    await pularOnboarding(ctxVis);
    const pageVis = await ctxVis.newPage();
    await pageVis.goto('/login');
    await pageVis.getByRole('main').getByLabel('Email').fill(VISITANTE_EMAIL);
    await pageVis.getByRole('main').getByLabel('Senha', { exact: true }).fill(SENHA);
    await pageVis.getByRole('main').getByRole('button', { name: 'Entrar' }).click();
    await expect(pageVis).toHaveURL(/\/$/);

    await pageVis.goto('/indicar');
    const formVis = pageVis.getByRole('main');
    await formVis.getByLabel('Nome da casa').fill(NOME_CASA);
    await formVis.getByLabel('Cidade').fill('Itajaí');
    await formVis.getByLabel('Estado (sigla)').fill('SC');
    await formVis.getByLabel(/Tradição/).selectOption('umbanda');
    await formVis.getByLabel(/Canal de contato/).fill('Instagram @casa-e2e');
    await formVis.getByRole('button', { name: /Enviar indicação/ }).click();

    await expect(formVis.getByRole('heading', { name: /Indicação recebida/i })).toBeVisible();
    await ctxVis.close();

    // 2) Admin valida (passo 1) — casa nasce pendente, NÃO pública
    const ctxAdm = await browser.newContext();
    await pularOnboarding(ctxAdm);
    const pageAdm = await ctxAdm.newPage();
    await pageAdm.goto('/login');
    await pageAdm.getByRole('main').getByLabel('Email').fill(ADMIN_EMAIL);
    await pageAdm.getByRole('main').getByLabel('Senha', { exact: true }).fill(SENHA);
    await pageAdm.getByRole('main').getByRole('button', { name: 'Entrar' }).click();
    await expect(pageAdm).toHaveURL(/\/$/);

    await pageAdm.goto('/admin');
    const lista = pageAdm.getByTestId('lista-indicacoes-pendentes');
    await expect(lista.getByText(NOME_CASA)).toBeVisible();
    await lista
      .getByRole('listitem')
      .filter({ hasText: NOME_CASA })
      .getByRole('button', { name: /Validar e criar casa pendente/ })
      .click();

    // 3) Confere que casa ainda NÃO está pública (mapa do anon)
    const ctxAnon = await browser.newContext();
    await pularOnboarding(ctxAnon);
    const pageAnon = await ctxAnon.newPage();
    await pageAnon.goto('/');
    // Não deve haver link/lista com esse nome.
    await pageAnon.getByRole('button', { name: /Ver em lista/ }).click();
    await expect(
      pageAnon.getByRole('dialog', { name: /Casas/ }).getByText(NOME_CASA),
    ).toHaveCount(0);
    await ctxAnon.close();

    // 4) Admin confirma consentimento (passo 2)
    await pageAdm.getByRole('tab', { name: /Passo 2/ }).click();
    const fila2 = pageAdm.getByTestId('lista-casas-pendentes');
    await expect(fila2.getByText(NOME_CASA)).toBeVisible();
    await fila2
      .getByRole('listitem')
      .filter({ hasText: NOME_CASA })
      .getByRole('button', { name: /Casa autorizou/ })
      .click();

    // 5) Agora casa aparece pro anon — e como NÃO verificada
    const ctxAnon2 = await browser.newContext();
    await pularOnboarding(ctxAnon2);
    const pageAnon2 = await ctxAnon2.newPage();
    await pageAnon2.goto('/');
    await pageAnon2.getByRole('button', { name: /Ver em lista/ }).click();
    await expect(
      pageAnon2.getByRole('dialog', { name: /Casas/ }).getByText(NOME_CASA),
    ).toBeVisible();
    // Casa indicada permanece "indicada — não verificada"
    await expect(
      pageAnon2.getByRole('dialog', { name: /Casas/ }).getByText(/indicada.*não verificada/i).first(),
    ).toBeVisible();

    await ctxAnon2.close();
    await ctxAdm.close();
  });
});
