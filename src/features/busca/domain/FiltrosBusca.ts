import { z } from 'zod';
import { DomainError } from '@/shared/lib/errors';
import {
  tradicaoPrincipalSchema,
  type TradicaoPrincipal,
} from '@/features/casas/schemas';
import {
  aceitaVisitantesSchema,
  enderecoVisibilidadeSchema,
  type AceitaVisitantes,
  type EnderecoVisibilidade,
} from '@/features/casas/domain/PerfilAbertura';
import {
  candombleNacao,
  type CandombleNacao,
} from '@/features/casas/domain/blocoCandombleEnums';

export const filtrosBuscaSchema = z.object({
  tradicao: tradicaoPrincipalSchema.optional(),
  cidade: z.string().trim().min(1).optional(),
  bairro: z.string().trim().min(1).optional(),
  aceitaVisitantes: aceitaVisitantesSchema.optional(),
  enderecoVisibilidade: enderecoVisibilidadeSchema.optional(),
  /** Linhas trabalhadas / linhagem (text[] no banco) — só faz sentido com tradicao=umbanda. */
  tags: z.array(z.string().trim().min(1)).optional(),
  /** Filtra por nação do Candomblé — só faz sentido com tradicao=candomble. */
  nacaoCandomble: candombleNacao.optional(),
  /** Filtra Quimbanda aberta a não-iniciados — só faz sentido com tradicao=quimbanda. */
  soAbertasQuimbanda: z.boolean().optional(),
});

export type FiltrosBuscaInput = z.infer<typeof filtrosBuscaSchema>;

/**
 * VO imutável de filtros da tela de busca.
 * Cada mutação retorna nova instância (referência muda → re-render previsível).
 * Conhece serialização pra/da URL e queryKey determinístico pra TanStack Query.
 */
export class FiltrosBusca {
  private constructor(
    readonly tradicao: TradicaoPrincipal | null,
    readonly cidade: string | null,
    readonly bairro: string | null,
    readonly aceitaVisitantes: AceitaVisitantes | null,
    readonly enderecoVisibilidade: EnderecoVisibilidade | null,
    readonly tags: ReadonlyArray<string>,
    readonly nacaoCandomble: CandombleNacao | null,
    readonly soAbertasQuimbanda: boolean,
  ) {}

  static vazio(): FiltrosBusca {
    return new FiltrosBusca(null, null, null, null, null, [], null, false);
  }

  static parse(raw: unknown): FiltrosBusca {
    const r = filtrosBuscaSchema.safeParse(raw);
    if (!r.success) {
      throw new DomainError(
        'FILTROS_INVALIDO',
        r.error.issues[0]?.message ?? 'Filtros inválidos',
      );
    }
    const v = r.data;
    return new FiltrosBusca(
      v.tradicao ?? null,
      v.cidade ?? null,
      v.bairro ?? null,
      v.aceitaVisitantes ?? null,
      v.enderecoVisibilidade ?? null,
      Object.freeze([...(v.tags ?? [])]),
      v.nacaoCandomble ?? null,
      v.soAbertasQuimbanda ?? false,
    );
  }

  static fromUrl(params: URLSearchParams): FiltrosBusca {
    const obj: Record<string, unknown> = {};
    const tradicao = params.get('tradicao');
    if (tradicao) obj.tradicao = tradicao;
    const cidade = params.get('cidade');
    if (cidade) obj.cidade = cidade;
    const bairro = params.get('bairro');
    if (bairro) obj.bairro = bairro;
    const aceita = params.get('aceitaVisitantes');
    if (aceita) obj.aceitaVisitantes = aceita;
    const visib = params.get('enderecoVisibilidade');
    if (visib) obj.enderecoVisibilidade = visib;
    const tags = params.getAll('tags').filter((t) => t.length > 0);
    if (tags.length > 0) obj.tags = tags;
    const nacao = params.get('nacaoCandomble');
    if (nacao) obj.nacaoCandomble = nacao;
    if (params.get('soAbertasQuimbanda') === 'true') {
      obj.soAbertasQuimbanda = true;
    }
    return FiltrosBusca.parse(obj);
  }

  /** Renderiza pra URLSearchParams; ordem estável pra queryKey + cache. */
  toQueryParams(): URLSearchParams {
    const p = new URLSearchParams();
    if (this.tradicao) p.set('tradicao', this.tradicao);
    if (this.cidade) p.set('cidade', this.cidade);
    if (this.bairro) p.set('bairro', this.bairro);
    if (this.aceitaVisitantes) p.set('aceitaVisitantes', this.aceitaVisitantes);
    if (this.enderecoVisibilidade) p.set('enderecoVisibilidade', this.enderecoVisibilidade);
    for (const tag of [...this.tags].sort()) p.append('tags', tag);
    if (this.nacaoCandomble) p.set('nacaoCandomble', this.nacaoCandomble);
    if (this.soAbertasQuimbanda) p.set('soAbertasQuimbanda', 'true');
    return p;
  }

  toQueryKey(): readonly unknown[] {
    return [
      'casas',
      'filtros',
      this.tradicao,
      this.cidade,
      this.bairro,
      this.aceitaVisitantes,
      this.enderecoVisibilidade,
      [...this.tags].sort(),
      this.nacaoCandomble,
      this.soAbertasQuimbanda,
    ];
  }

  comTradicao(t: TradicaoPrincipal | null): FiltrosBusca {
    // Mudou de tradição → filtros polimórficos ficam órfãos (eram específicos
    // da tradição anterior). Mantemos tags só se a tradição não mudou.
    const novasTags = t === this.tradicao ? this.tags : [];
    const novaNacao = t === 'candomble' ? this.nacaoCandomble : null;
    const novaAbertura = t === 'quimbanda' ? this.soAbertasQuimbanda : false;
    return new FiltrosBusca(
      t,
      this.cidade,
      this.bairro,
      this.aceitaVisitantes,
      this.enderecoVisibilidade,
      novasTags,
      novaNacao,
      novaAbertura,
    );
  }

  comCidade(c: string | null): FiltrosBusca {
    return this.copiaCom({ cidade: c });
  }

  comBairro(b: string | null): FiltrosBusca {
    return this.copiaCom({ bairro: b });
  }

  comAceitaVisitantes(v: AceitaVisitantes | null): FiltrosBusca {
    return this.copiaCom({ aceitaVisitantes: v });
  }

  comEnderecoVisibilidade(v: EnderecoVisibilidade | null): FiltrosBusca {
    return this.copiaCom({ enderecoVisibilidade: v });
  }

  comTagAlternada(tag: string): FiltrosBusca {
    const t = tag.trim();
    if (!t) return this;
    const set = new Set(this.tags);
    if (set.has(t)) set.delete(t);
    else set.add(t);
    return this.copiaCom({ tags: Object.freeze([...set]) });
  }

  comNacaoCandomble(n: CandombleNacao | null): FiltrosBusca {
    return this.copiaCom({ nacaoCandomble: n });
  }

  comSoAbertasQuimbanda(v: boolean): FiltrosBusca {
    return this.copiaCom({ soAbertasQuimbanda: v });
  }

  estaVazio(): boolean {
    return (
      !this.tradicao &&
      !this.cidade &&
      !this.bairro &&
      !this.aceitaVisitantes &&
      !this.enderecoVisibilidade &&
      this.tags.length === 0 &&
      !this.nacaoCandomble &&
      !this.soAbertasQuimbanda
    );
  }

  private copiaCom(
    overrides: Partial<{
      cidade: string | null;
      bairro: string | null;
      aceitaVisitantes: AceitaVisitantes | null;
      enderecoVisibilidade: EnderecoVisibilidade | null;
      tags: ReadonlyArray<string>;
      nacaoCandomble: CandombleNacao | null;
      soAbertasQuimbanda: boolean;
    }>,
  ): FiltrosBusca {
    return new FiltrosBusca(
      this.tradicao,
      overrides.cidade !== undefined ? overrides.cidade : this.cidade,
      overrides.bairro !== undefined ? overrides.bairro : this.bairro,
      overrides.aceitaVisitantes !== undefined
        ? overrides.aceitaVisitantes
        : this.aceitaVisitantes,
      overrides.enderecoVisibilidade !== undefined
        ? overrides.enderecoVisibilidade
        : this.enderecoVisibilidade,
      overrides.tags ?? this.tags,
      overrides.nacaoCandomble !== undefined
        ? overrides.nacaoCandomble
        : this.nacaoCandomble,
      overrides.soAbertasQuimbanda ?? this.soAbertasQuimbanda,
    );
  }
}
