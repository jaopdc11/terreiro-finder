import { test, expect } from './fixtures/test';
import { bancoE2E, removerUsuariosPorEmailPrefix } from './fixtures/banco';

const PREFIX = 'e2e-painel+';
const EMAIL_DIR = `${PREFIX}dirigente@test.local`;
const SENHA = 'senhaforte';

const CASA_SLUG = 'seed-tenda-pai-joao'; // umbanda, aprovada, verificada (seed)

test.describe('painel do dirigente', () => {
  let casaId = '';

  test.beforeAll(async () => {
    const banco = bancoE2E();
    await removerUsuariosPorEmailPrefix(PREFIX);
    const u = await banco.criarUsuario({ email: EMAIL_DIR, senha: SENHA, papel: 'dirigente', nome: 'Dirigente Painel E2E' });
    const casa = await banco.um<{ id: string }>('select id from casas where slug = $1', [CASA_SLUG]);
    if (!casa) throw new Error(`casa ${CASA_SLUG} ausente — globalSetup rodou?`);
    casaId = casa.id;
    await banco.vincularDirigente(casaId, u.id);
  });

  test.afterAll(async () => {
    const banco = bancoE2E();
    // Restaura campos editáveis (perfil/abertura) e o bloco umbanda pro estado do seed.
    await banco.pool.query(
      `update casas set descricao = null, sacerdote_nome = 'Pai João', texto_antes_visita = null,
         endereco_visibilidade = 'publico', aceita_visitantes = 'aberto' where id = $1`,
      [casaId],
    );
    await banco.pool.query(
      `insert into casa_umbanda (casa_id, linhas_trabalhadas, linhagem) values ($1, '{caboclo,pretovelho}', '{}')
       on conflict (casa_id) do update set linhas_trabalhadas = excluded.linhas_trabalhadas, linhagem = '{}',
         sincretismo = null, influencia_kardecista = null, sacralizacao = null`,
      [casaId],
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
    const SOLO_EMAIL = `${PREFIX}solo@test.local`;
    await bancoE2E().criarUsuario({ email: SOLO_EMAIL, senha: SENHA, nome: 'Solo E2E' });

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
