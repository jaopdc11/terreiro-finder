import { z } from 'zod';
import { DomainError } from '@/shared/lib/errors';

// Validação leniente: aceita WhatsApp/telefone em formato livre, com pelo menos 8 dígitos.
// Não normaliza pra E.164 no MVP — é exibido como o dirigente cadastrou.
const telefoneSchema = z
  .string()
  .trim()
  .min(8, 'Telefone muito curto')
  .refine((v) => v.replace(/\D/g, '').length >= 8, 'Telefone precisa de pelo menos 8 dígitos');

const emailSchema = z.string().trim().email('Email inválido');
const siteSchema = z
  .string()
  .trim()
  .url('URL inválida — comece com http:// ou https://');

const contatoSchema = z
  .object({
    whatsapp: telefoneSchema.optional(),
    telefone: telefoneSchema.optional(),
    email: emailSchema.optional(),
    site: siteSchema.optional(),
  })
  .refine(
    (v) => Boolean(v.whatsapp ?? v.telefone ?? v.email),
    'Pelo menos um canal de contato direto é necessário (WhatsApp, telefone ou email)',
  );

export type ContatoInput = z.infer<typeof contatoSchema>;

export class Contato {
  private constructor(
    readonly whatsapp: string | null,
    readonly telefone: string | null,
    readonly email: string | null,
    readonly site: string | null,
  ) {}

  static parse(raw: unknown): Contato {
    const r = contatoSchema.safeParse(raw);
    if (!r.success) {
      throw new DomainError(
        'CONTATO_INVALIDO',
        r.error.issues[0]?.message ?? 'Contato inválido',
      );
    }
    return new Contato(
      r.data.whatsapp ?? null,
      r.data.telefone ?? null,
      r.data.email ?? null,
      r.data.site ?? null,
    );
  }

  /** Aceita nulls vindos do banco; retorna null se nada foi informado. */
  static deRow(row: {
    whatsapp?: unknown;
    telefone?: unknown;
    email_contato?: unknown;
    site?: unknown;
  }): Contato | null {
    const wa = typeof row.whatsapp === 'string' && row.whatsapp.length > 0 ? row.whatsapp : null;
    const tel =
      typeof row.telefone === 'string' && row.telefone.length > 0 ? row.telefone : null;
    const mail =
      typeof row.email_contato === 'string' && row.email_contato.length > 0
        ? row.email_contato
        : null;
    const site = typeof row.site === 'string' && row.site.length > 0 ? row.site : null;
    if (!wa && !tel && !mail && !site) return null;
    return new Contato(wa, tel, mail, site);
  }

  /** Primeiro canal de contato direto. Site não conta — é divulgação, não contato. */
  principal(): { tipo: 'whatsapp' | 'telefone' | 'email'; valor: string } | null {
    if (this.whatsapp) return { tipo: 'whatsapp', valor: this.whatsapp };
    if (this.telefone) return { tipo: 'telefone', valor: this.telefone };
    if (this.email) return { tipo: 'email', valor: this.email };
    return null;
  }
}
