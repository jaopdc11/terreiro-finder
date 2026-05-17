import { test, expect } from '@playwright/test';
import { adminClient, removerUsuariosPorEmailPrefix } from './fixtures/auth-helpers';

const PREFIX = 'e2e-rei+';
const EMAIL_SOL = `${PREFIX}solicitante@test.local`;
const EMAIL_ADM = `${PREFIX}admin@test.local`;
const SENHA = 'senhaforte';

// Esta casa nasce do seed como fonte='indicacao', status='aprovada' (logo,
// aparece no mapa mas estaVerificada()=false e mostra o aviso na ficha).
const SLUG = 'seed-casa-indicada';

test.describe('reivindicação com contato cruzado', () => {
  let casaId = '';
  let solicitanteId = '';

  test.beforeAll(async () => {
    const admin = adminClient();
    await removerUsuariosPorEmailPrefix(PREFIX);

    // Cria users (solicitante visitante + admin)
    const { data: sol, error: e1 } = await admin.auth.admin.createUser({
      email: EMAIL_SOL,
      password: SENHA,
      email_confirm: true,
      user_metadata: { nome_completo: 'Solicitante E2E' },
    });
    if (e1 || !sol.user) throw e1 ?? new Error('createUser sol');
    solicitanteId = sol.user.id;

    const { data: adm, error: e2 } = await admin.auth.admin.createUser({
      email: EMAIL_ADM,
      password: SENHA,
      email_confirm: true,
      user_metadata: { nome_completo: 'Admin E2E' },
    });
    if (e2 || !adm.user) throw e2 ?? new Error('createUser adm');
    await admin.from('profiles').update({ role: 'admin' }).eq('id', adm.user.id);

    // Adiciona um WhatsApp na casa pra testar contato cruzado visível no admin.
    const { data: casa, error: e3 } = await admin
      .from('casas')
      .update({ whatsapp: '47999990000' })
      .eq('slug', SLUG)
      .select('id')
      .single();
    if (e3 || !casa) throw e3 ?? new Error(`casa ${SLUG} ausente`);
    casaId = casa.id;
  });

  test.afterAll(async () => {
    const admin = adminClient();
    // Limpa reivindicações criadas no fluxo
    await admin.from('reivindicacoes').delete().eq('user_id', solicitanteId);
    // Desvincula dirigente se foi criado
    await admin
      .from('casa_dirigentes')
      .delete()
      .eq('casa_id', casaId)
      .eq('user_id', solicitanteId);
    // Restaura casa pro estado do seed: fonte=indicacao, sem whatsapp
    await admin
      .from('casas')
      .update({ fonte: 'indicacao', whatsapp: null })
      .eq('id', casaId);
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

  test('fluxo: solicitante reivindica → admin contata e aprova → casa vira verificada', async ({
    browser,
  }) => {
    // === Solicitante ===
    const cSol = await browser.newContext();
    await cSol.addInitScript(() => {
      localStorage.setItem(
        'terreiros.onboarding',
        JSON.stringify({ state: { passo: 0, bifurcacao: null, concluido: true }, version: 0 }),
      );
    });
    const pSol = await cSol.newPage();
    await pSol.goto('/login');
    await pSol.getByRole('main').getByLabel('Email').fill(EMAIL_SOL);
    await pSol.getByRole('main').getByLabel('Senha', { exact: true }).fill(SENHA);
    await pSol.getByRole('main').getByRole('button', { name: 'Entrar' }).click();
    await expect(pSol).toHaveURL(/\/$/);

    // Abre ficha da casa não-verificada; deve ver aviso e link "Reivindique aqui"
    await pSol.goto(`/casa/${SLUG}`);
    await expect(pSol.getByText(/indicada — não verificada/i).first()).toBeVisible();
    await pSol.getByRole('link', { name: /Reivindique aqui/i }).click();
    await expect(pSol).toHaveURL(/\/reivindicar/);

    await pSol
      .getByLabel(/Conta sua história/i)
      .fill('Sou Mãe-de-santo principal desde 2018, iniciada pela Mãe Joana de Aruanda.');
    await pSol.getByRole('button', { name: /Enviar reivindicação/ }).click();
    await expect(pSol.getByRole('heading', { name: /Pedido recebido/i })).toBeVisible();
    await cSol.close();

    // === Admin ===
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
    await pAdm.getByRole('tab', { name: 'Reivindicações' }).click();

    const lista = pAdm.getByTestId('lista-reivindicacoes-pendentes');
    await expect(lista).toBeVisible();
    // Contato cruzado: o admin vê o WhatsApp já registrado pra contatar.
    await expect(lista.getByText('47999990000')).toBeVisible();
    // O que a pessoa disse aparece
    await expect(lista.getByText(/Mãe Joana de Aruanda/i)).toBeVisible();

    // Aprova só a entrada dessa reivindicação (DB compartilhado com outras
    // reivindicações de specs anteriores/script de dev — filtra pelo texto).
    const item = lista.getByRole('listitem').filter({ hasText: /Mãe Joana de Aruanda/i });
    await item.getByRole('button', { name: /Casa confirmou — aprovar/ }).click();
    // Fila esvazia (ou ao menos a entrada some)
    await expect(lista.getByText(/Mãe Joana de Aruanda/i)).toBeHidden({ timeout: 5_000 });
    await cAdm.close();

    // === Anônimo ===
    // Casa agora deve estar verificada — sem aviso de "não verificada" na ficha.
    const cAnon = await browser.newContext();
    await cAnon.addInitScript(() => {
      localStorage.setItem(
        'terreiros.onboarding',
        JSON.stringify({ state: { passo: 0, bifurcacao: null, concluido: true }, version: 0 }),
      );
    });
    const pAnon = await cAnon.newPage();
    await pAnon.goto(`/casa/${SLUG}`);
    await expect(
      pAnon.getByRole('heading', { level: 1, name: /Casa Indicada/i }),
    ).toBeVisible();
    await expect(pAnon.getByText(/indicada — não verificada/i)).toHaveCount(0);
    await cAnon.close();
  });
});
