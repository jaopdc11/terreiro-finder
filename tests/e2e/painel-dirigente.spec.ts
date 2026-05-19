import { test, expect } from '@playwright/test';
import { adminClient, removerUsuariosPorEmailPrefix } from './fixtures/auth-helpers';

const PREFIX = 'e2e-painel+';
const EMAIL_DIR = `${PREFIX}dirigente@test.local`;
const SENHA = 'senhaforte';

const CASA_SLUG = 'seed-tenda-pai-joao'; // umbanda, aprovada, verificada (seed)

test.describe('painel do dirigente', () => {
  let casaId = '';
  let dirigenteId = '';

  test.beforeAll(async () => {
    const admin = adminClient();
    await removerUsuariosPorEmailPrefix(PREFIX);

    const { data: u, error: eu } = await admin.auth.admin.createUser({
      email: EMAIL_DIR,
      password: SENHA,
      email_confirm: true,
      user_metadata: { nome_completo: 'Dirigente Painel E2E' },
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
    await admin
      .from('casa_dirigentes')
      .delete()
      .eq('casa_id', casaId)
      .eq('user_id', dirigenteId);
    // Restaura campos editáveis (perfil/abertura) pra valores do seed.
    await admin
      .from('casas')
      .update({
        descricao: null,
        sacerdote_nome: 'Pai João',
        texto_antes_visita: null,
        endereco_visibilidade: 'publico',
        aceita_visitantes: 'aberto',
      })
      .eq('id', casaId);
    // Reset bloco umbanda pro estado do seed.
    await admin
      .from('casa_umbanda')
      .upsert(
        {
          casa_id: casaId,
          linhas_trabalhadas: ['caboclo', 'pretovelho'],
          linhagem: [],
        },
        { onConflict: 'casa_id' },
      );
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

  test('dirigente edita perfil, abertura e bloco Umbanda da própria casa', async ({ page }) => {
    // Login
    await page.goto('/login');
    const main = page.getByRole('main');
    await main.getByLabel('Email').fill(EMAIL_DIR);
    await main.getByLabel('Senha', { exact: true }).fill(SENHA);
    await main.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });

    // Vai pro painel e seleciona a casa
    await page.goto('/painel');
    await expect(page.getByRole('heading', { level: 1, name: /Painel da dirigência/i })).toBeVisible();
    await page.getByRole('button', { name: /Tenda Pai João/i }).click();
    await expect(page.getByRole('heading', { level: 1, name: /Tenda Pai João/i })).toBeVisible();

    // Aba Perfil — edita descrição + sacerdote
    const descricao = `Casa de Umbanda fundada em 1972 — editada no E2E ${Date.now()}`;
    await page.getByLabel('Sobre a casa').fill(descricao);
    await page.getByLabel('Sacerdote(isa)').fill('Pai João de Aruanda');
    await page.getByRole('button', { name: 'Salvar perfil' }).click();
    await expect(page.getByText('Perfil salvo.')).toBeVisible({ timeout: 5_000 });

    // Aba Abertura — muda foto_registro (input radio é sr-only; clica no label)
    await page.getByRole('tab', { name: 'Abertura' }).click();
    await page.getByText('Permitido', { exact: true }).click();
    await page.getByRole('button', { name: 'Salvar abertura' }).click();
    await expect(page.getByText('Abertura salva.')).toBeVisible({ timeout: 5_000 });

    // Aba Tradição — adiciona uma linha trabalhada nova
    await page.getByRole('tab', { name: 'Tradição' }).click();
    await page.getByRole('button', { name: 'crianca', exact: true }).click();
    await page.getByRole('button', { name: /Salvar tradição/i }).click();
    await expect(page.getByText('Bloco Umbanda salvo.')).toBeVisible({ timeout: 5_000 });

    // Confirma persistência via ficha pública (mexe na descricao deve aparecer)
    await page.goto(`/casa/${CASA_SLUG}`);
    await expect(page.getByText(/fundada em 1972/i)).toBeVisible();
    await expect(page.getByText(/com Pai João de Aruanda/i)).toBeVisible();
  });

  test('usuário sem casas vê estado vazio', async ({ page, browser }) => {
    // Cria um user solo (sem vínculo)
    const admin = adminClient();
    const SOLO_EMAIL = `${PREFIX}solo@test.local`;
    await admin.auth.admin.createUser({
      email: SOLO_EMAIL,
      password: SENHA,
      email_confirm: true,
      user_metadata: { nome_completo: 'Solo E2E' },
    });

    const ctx = await browser.newContext();
    await ctx.addInitScript(() => {
      localStorage.setItem(
        'encruza.onboarding',
        JSON.stringify({ state: { passo: 0, bifurcacao: null, concluido: true }, version: 0 }),
      );
    });
    const p = await ctx.newPage();
    await p.goto('/login');
    await p.getByRole('main').getByLabel('Email').fill(SOLO_EMAIL);
    await p.getByRole('main').getByLabel('Senha', { exact: true }).fill(SENHA);
    await p.getByRole('main').getByRole('button', { name: 'Entrar' }).click();
    await expect(p).toHaveURL(/\/$/);

    await p.goto('/painel');
    await expect(p.getByText(/ainda não está vinculada/i)).toBeVisible();
    await expect(p.getByText(/Reivindique aqui/i)).toBeVisible();
    await ctx.close();

    // Mantém o user solo no afterAll que limpa pelo prefix; nada a fazer aqui.
    expect(page).toBeTruthy();
  });
});
