import { test, expect } from '@playwright/test';
import { adminClient, removerUsuariosPorEmailPrefix } from './fixtures/auth-helpers';

const PREFIX = 'e2e-agenda+';
const EMAIL = `${PREFIX}dirigente@test.local`;
const SENHA = 'senhaforte';
const CASA_SLUG = 'seed-tenda-pai-joao';

test.describe('agenda da casa', () => {
  let casaId = '';
  let dirigenteId = '';

  test.beforeAll(async () => {
    const admin = adminClient();
    await removerUsuariosPorEmailPrefix(PREFIX);

    const { data: u, error: eu } = await admin.auth.admin.createUser({
      email: EMAIL,
      password: SENHA,
      email_confirm: true,
      user_metadata: { nome_completo: 'Dirigente Agenda E2E' },
    });
    if (eu || !u.user) throw eu ?? new Error('createUser');
    dirigenteId = u.user.id;
    await admin.from('profiles').update({ role: 'dirigente' }).eq('id', dirigenteId);

    const { data: casa, error: ec } = await admin
      .from('casas')
      .select('id')
      .eq('slug', CASA_SLUG)
      .single();
    if (ec || !casa) throw ec ?? new Error(`casa ${CASA_SLUG} ausente — globalSetup rodou?`);
    casaId = casa.id;

    await admin
      .from('casa_dirigentes')
      .upsert(
        { casa_id: casaId, user_id: dirigenteId, papel: 'principal' },
        { onConflict: 'casa_id,user_id' },
      );
  });

  test.afterAll(async () => {
    const admin = adminClient();
    await admin.from('casa_agenda').delete().eq('casa_id', casaId);
    await admin
      .from('casa_dirigentes')
      .delete()
      .eq('casa_id', casaId)
      .eq('user_id', dirigenteId);
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

  test('dirigente cria gira + evento e ambos aparecem na ficha pública', async ({ page, browser }) => {
    // Login
    await page.goto('/login');
    const main = page.getByRole('main');
    await main.getByLabel('Email').fill(EMAIL);
    await main.getByLabel('Senha', { exact: true }).fill(SENHA);
    await main.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });

    // Painel → seleciona casa → aba Agenda
    await page.goto('/painel');
    await page.getByRole('button', { name: /Tenda Pai João/i }).click();
    await page.getByRole('tab', { name: 'Agenda' }).click();

    // Cria gira
    await page.getByRole('button', { name: '+ Gira semanal' }).click();
    await page.getByLabel('Título').fill('Gira de Pretos-Velhos');
    await page.getByLabel('Dia da semana').selectOption('1'); // segunda
    await page.getByLabel('Início (opcional)').fill('19:00');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Gira de Pretos-Velhos')).toBeVisible();
    await expect(page.getByText(/Toda segunda às 19h/)).toBeVisible();

    // Cria evento com data
    await page.getByRole('button', { name: '+ Evento' }).click();
    await page.getByLabel('Título').fill('Festa de Iemanjá');
    await page.getByLabel('Data (se houver)').fill('2027-02-02');
    await page.getByLabel('Início (opcional)').fill('08:00');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Festa de Iemanjá')).toBeVisible();

    // Ficha pública (em outra sessão anon) mostra os dois
    const anon = await browser.newContext();
    const p2 = await anon.newPage();
    await p2.addInitScript(() => {
      localStorage.setItem(
        'encruza.onboarding',
        JSON.stringify({ state: { passo: 0, bifurcacao: null, concluido: true }, version: 0 }),
      );
    });
    await p2.goto(`/casa/${CASA_SLUG}`);
    await expect(p2.getByText('Gira de Pretos-Velhos')).toBeVisible();
    await expect(p2.getByText(/Toda segunda às 19h/)).toBeVisible();
    await expect(p2.getByText('Festa de Iemanjá')).toBeVisible();
    await expect(p2.getByText(/02\/02\/2027 às 8h/)).toBeVisible();
    await anon.close();
  });
});
