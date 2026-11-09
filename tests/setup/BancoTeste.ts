import pg from 'pg';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';

/**
 * Seed direto no Postgres dos testes (container descartável). Faz o que a
 * API não expõe de propósito: criar usuário já confirmado, promover admin,
 * criar casa em qualquer status/fonte.
 */

export type Papel = 'visitante' | 'dirigente' | 'admin';

export interface CasaSeed {
  slug: string;
  nome: string;
  tradicao?: 'umbanda' | 'candomble' | 'quimbanda' | 'omoloco' | 'xamba' | 'outra';
  status?: 'pendente' | 'aprovada' | 'recusada' | 'arquivada';
  fonte?: 'indicacao' | 'proprio' | 'reivindicada';
  cidade?: string;
  estado?: string;
  bairro?: string | null;
  logradouro?: string | null;
  enderecoVisibilidade?: 'publico' | 'sob_contato' | 'oculto';
  aceitaVisitantes?: 'aberto' | 'jogo_previo' | 'so_indicacao';
  coordLat?: number | null;
  coordLng?: number | null;
  whatsapp?: string | null;
  sacerdoteNome?: string | null;
  criadaPor?: string | null;
  canalValidacao?: string | null;
  linhasTrabalhadas?: string[];
  linhagem?: string[];
  descricao?: string | null;
}

export const SENHA_PADRAO = 'senha-de-teste-1';

// Hash único reaproveitado: bcrypt custo 4 (aceito pelo compare da API) pra não pesar.
let hashPadrao: string | null = null;
function hash(senha: string): string {
  if (senha === SENHA_PADRAO) return (hashPadrao ??= bcrypt.hashSync(SENHA_PADRAO, 4));
  return bcrypt.hashSync(senha, 4);
}

export class BancoTeste {
  readonly pool: pg.Pool;

  constructor(url: string) {
    this.pool = new pg.Pool({ connectionString: url, max: 3 });
  }

  fechar(): Promise<void> {
    return this.pool.end();
  }

  async criarUsuario(input: {
    email?: string;
    senha?: string;
    papel?: Papel;
    nome?: string;
    confirmado?: boolean;
  } = {}): Promise<{ id: string; email: string; senha: string }> {
    const email = (input.email ?? `u-${randomUUID()}@teste.local`).toLowerCase();
    const senha = input.senha ?? SENHA_PADRAO;
    const { rows } = await this.pool.query<{ id: string }>(
      `insert into usuarios (email, senha_hash, email_confirmado_em, nome_completo, nome_exibicao, role)
       values ($1, $2, $3, $4, $4, $5) returning id`,
      [email, hash(senha), input.confirmado === false ? null : new Date(), input.nome ?? 'Pessoa de Teste', input.papel ?? 'visitante'],
    );
    const id = rows[0]?.id;
    if (!id) throw new Error('insert de usuário sem id');
    return { id, email, senha };
  }

  async criarCasa(c: CasaSeed): Promise<string> {
    const { rows } = await this.pool.query<{ id: string }>(
      `insert into casas (slug, nome, tradicao_principal, status, fonte, cidade, estado, bairro, logradouro,
         endereco_visibilidade, aceita_visitantes, coord_lat, coord_lng, whatsapp, sacerdote_nome,
         criada_por, canal_validacao, aprovada_em)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) returning id`,
      [
        c.slug,
        c.nome,
        c.tradicao ?? 'umbanda',
        c.status ?? 'aprovada',
        c.fonte ?? 'proprio',
        c.cidade ?? 'Itajaí',
        c.estado ?? 'SC',
        c.bairro === undefined ? 'Centro' : c.bairro,
        c.logradouro === undefined ? 'Rua das Flores, 10' : c.logradouro,
        c.enderecoVisibilidade ?? 'publico',
        c.aceitaVisitantes ?? 'aberto',
        c.coordLat === undefined ? -26.9123456 : c.coordLat,
        c.coordLng === undefined ? -48.6612345 : c.coordLng,
        c.whatsapp === undefined ? '47999990000' : c.whatsapp,
        c.sacerdoteNome ?? null,
        c.criadaPor ?? null,
        c.canalValidacao ?? null,
        (c.status ?? 'aprovada') === 'aprovada' ? new Date() : null,
      ],
    );
    const id = rows[0]?.id;
    if (!id) throw new Error('insert de casa sem id');
    if (c.descricao) await this.pool.query('update casas set descricao = $2 where id = $1', [id, c.descricao]);
    if ((c.linhasTrabalhadas || c.linhagem) && (c.tradicao ?? 'umbanda') === 'umbanda') {
      await this.pool.query('insert into casa_umbanda (casa_id, linhas_trabalhadas, linhagem) values ($1, $2, $3)', [
        id,
        c.linhasTrabalhadas ?? [],
        c.linhagem ?? [],
      ]);
    }
    return id;
  }

  async vincularDirigente(casaId: string, usuarioId: string): Promise<void> {
    await this.pool.query(
      `insert into casa_dirigentes (casa_id, user_id, papel) values ($1, $2, 'principal') on conflict do nothing`,
      [casaId, usuarioId],
    );
  }

  /** Remove usuários de teste pelo prefixo do e-mail (cascata leva sessões, vínculos etc.). */
  async removerUsuariosPorPrefixo(prefixo: string): Promise<void> {
    await this.pool.query('delete from usuarios where email like $1', [`${prefixo.toLowerCase()}%`]);
  }

  async um<T extends pg.QueryResultRow>(sql: string, params: unknown[] = []): Promise<T | undefined> {
    return (await this.pool.query<T>(sql, params)).rows[0];
  }

  /** Apaga tudo (entre arquivos de teste). Ordem por causa das FKs: truncate cascade resolve. */
  async limparTudo(): Promise<void> {
    await this.pool.query(
      `truncate usuarios, casas, sessoes, tokens_email, casa_dirigentes, casa_fotos, casa_umbanda,
         casa_candomble, casa_quimbanda, casa_agenda, indicacoes_casa, reivindicacoes, favoritos cascade`,
    );
  }
}
