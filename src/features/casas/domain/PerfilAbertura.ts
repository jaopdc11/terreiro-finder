import { z } from 'zod';
import { DomainError } from '@/shared/lib/errors';

export const enderecoVisibilidadeSchema = z.enum(['publico', 'sob_contato', 'oculto']);
export type EnderecoVisibilidade = z.infer<typeof enderecoVisibilidadeSchema>;

export const aceitaVisitantesSchema = z.enum(['aberto', 'jogo_previo', 'so_indicacao']);
export type AceitaVisitantes = z.infer<typeof aceitaVisitantesSchema>;

export const fotoRegistroSchema = z.enum(['permitido', 'proibido', 'parcial']);
export type FotoRegistro = z.infer<typeof fotoRegistroSchema>;

export const perfilAberturaSchema = z.object({
  enderecoVisibilidade: enderecoVisibilidadeSchema,
  aceitaVisitantes: aceitaVisitantesSchema,
  fotoRegistro: fotoRegistroSchema,
});

export type PerfilAberturaInput = z.infer<typeof perfilAberturaSchema>;

/**
 * VO imutável que reúne os 3 toggles de exposição da casa.
 * Cada mutação retorna uma nova instância.
 */
export class PerfilAbertura {
  private constructor(
    readonly enderecoVisibilidade: EnderecoVisibilidade,
    readonly aceitaVisitantes: AceitaVisitantes,
    readonly fotoRegistro: FotoRegistro,
  ) {}

  static parse(raw: unknown): PerfilAbertura {
    const r = perfilAberturaSchema.safeParse(raw);
    if (!r.success) {
      throw new DomainError(
        'PERFIL_ABERTURA_INVALIDO',
        r.error.issues[0]?.message ?? 'Perfil de abertura inválido',
      );
    }
    return new PerfilAbertura(r.data.enderecoVisibilidade, r.data.aceitaVisitantes, r.data.fotoRegistro);
  }

  static padrao(): PerfilAbertura {
    return new PerfilAbertura('sob_contato', 'jogo_previo', 'parcial');
  }

  enderecoEhPublico(): boolean {
    return this.enderecoVisibilidade === 'publico';
  }

  exigeIndicacaoPraVisitar(): boolean {
    return this.aceitaVisitantes === 'so_indicacao';
  }

  comEnderecoVisibilidade(v: EnderecoVisibilidade): PerfilAbertura {
    return new PerfilAbertura(v, this.aceitaVisitantes, this.fotoRegistro);
  }

  comAceitaVisitantes(v: AceitaVisitantes): PerfilAbertura {
    return new PerfilAbertura(this.enderecoVisibilidade, v, this.fotoRegistro);
  }

  comFotoRegistro(v: FotoRegistro): PerfilAbertura {
    return new PerfilAbertura(this.enderecoVisibilidade, this.aceitaVisitantes, v);
  }
}
