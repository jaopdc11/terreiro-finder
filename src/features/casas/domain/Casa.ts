import { DomainError } from '@/shared/lib/errors';
import {
  casaRowSchema,
  type CasaFonte,
  type CasaRow,
  type CasaStatus,
  type TradicaoPrincipal,
} from '../schemas';
import { Slug } from './Slug';
import { Coordenadas } from './Coordenadas';
import { Contato } from './Contato';
import { PerfilAbertura } from './PerfilAbertura';

export interface SessaoMinima {
  readonly userId: string;
  podeAdministrar(): boolean;
}

export class Casa {
  private constructor(
    readonly id: string,
    readonly slug: Slug,
    readonly nome: string,
    readonly descricao: string | null,
    readonly sacerdoteNome: string | null,
    readonly tradicaoPrincipal: TradicaoPrincipal,
    readonly status: CasaStatus,
    readonly fonte: CasaFonte,
    readonly cidade: string,
    readonly estado: string,
    private readonly logradouro: string | null,
    private readonly numero: string | null,
    private readonly complemento: string | null,
    readonly bairro: string | null,
    readonly cep: string | null,
    readonly perfilAbertura: PerfilAbertura,
    readonly coordenadas: Coordenadas | null,
    readonly contato: Contato | null,
    readonly textoAntesVisita: string | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly aprovadaEm: Date | null,
    readonly aprovadaPor: string | null,
    readonly criadaPor: string | null,
  ) {}

  static fromRow(raw: unknown): Casa {
    const r = casaRowSchema.safeParse(raw);
    if (!r.success) {
      throw new DomainError(
        'CASA_ROW_INVALIDA',
        `Row de casa inválida: ${r.error.issues[0]?.message ?? 'erro'}`,
        { cause: r.error },
      );
    }
    const row: CasaRow = r.data;

    const perfil = PerfilAbertura.parse({
      enderecoVisibilidade: row.endereco_visibilidade,
      aceitaVisitantes: row.aceita_visitantes,
      fotoRegistro: row.foto_registro,
    });

    return new Casa(
      row.id,
      Slug.parse(row.slug),
      row.nome,
      row.descricao,
      row.sacerdote_nome,
      row.tradicao_principal,
      row.status,
      row.fonte,
      row.cidade,
      row.estado,
      row.logradouro,
      row.numero,
      row.complemento,
      row.bairro,
      row.cep,
      perfil,
      Coordenadas.deRow(row.coord_lat, row.coord_lng),
      Contato.deRow(row),
      row.texto_antes_visita,
      new Date(row.created_at),
      new Date(row.updated_at),
      row.aprovada_em ? new Date(row.aprovada_em) : null,
      row.aprovada_por,
      row.criada_por ?? null,
    );
  }

  /** Regra de domínio única — pin e badge derivam daqui (06-modelo-dados.md §7.3). */
  estaVerificada(): boolean {
    return (
      (this.fonte === 'proprio' || this.fonte === 'reivindicada') && this.status === 'aprovada'
    );
  }

  estaAprovada(): boolean {
    return this.status === 'aprovada';
  }

  /** Endereço só aparece publicamente se a casa autorizou (princípio §1.2 #4). */
  enderecoPublico(): string | null {
    if (!this.perfilAbertura.enderecoEhPublico()) return null;
    const partes = [
      this.logradouro,
      this.numero,
      this.complemento,
      this.bairro,
      this.cidade && this.estado ? `${this.cidade}/${this.estado}` : null,
      this.cep,
    ].filter((p): p is string => Boolean(p && p.length > 0));
    if (partes.length === 0) return null;
    return partes.join(', ');
  }

  podeSerEditadaPor(sessao: SessaoMinima | null, dirigentes: ReadonlySet<string>): boolean {
    if (!sessao) return false;
    if (sessao.podeAdministrar()) return true;
    return dirigentes.has(sessao.userId);
  }
}
