import { test, expect } from './fixtures/test';
import { bancoE2E, removerUsuariosPorEmailPrefix } from './fixtures/banco';

const PREFIX = 'e2e-rei+';
const EMAIL_SOL = `${PREFIX}solicitante@test.local`;
const EMAIL_ADM = `${PREFIX}admin@test.local`;
const SENHA = 'senhaforte';

// Esta casa nasce do seed como fonte='indicacao', status='aprovada' (logo,
// aparece no mapa mas estaVerificada()=false e mostra o aviso na ficha).
const SLUG = 'seed-casa-indicada';

test.describe('reivindicação com contato cruzado', () => {
  let casaId = '';

  test.beforeAll(async () => {
    const banco = bancoE2E();
    await removerUsuariosPorEmailPrefix(PREFIX);
    await banco.criarUsuario({ email: EMAIL_SOL, senha: SENHA, nome: 'Solicitante E2E' });
    await banco.criarUsuario({ email: EMAIL_ADM, senha: SENHA, papel: 'admin', nome: 'Admin E2E' });

    // Adiciona um WhatsApp na casa pra testar contato cruzado visível no admin.
    const casa = await banco.um<{ id: string }>(
      "update casas set whatsapp = '47999990000' where slug = $1 returning id",
      [SLUG],
    );
    if (!casa) throw new Error(`casa ${SLUG} ausente`);
    casaId = casa.id;
  });

  test.afterAll(async () => {
    // Restaura a casa pro estado do seed; apagar o usuário leva reivindicação e vínculo (cascade)
    await bancoE2E().pool.query("update casas set fonte = 'indicacao', whatsapp = null where id = $1", [casaId]);
    await removerUsuariosPorEmailPrefix(PREFIX);
  });

  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      localStorage.setItem(
        'encruza.onboarding',
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
        'encruza.onboarding',
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
        'encruza.onboarding',
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
        'encruza.onboarding',
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
