import { useState } from 'react';
import { Check, Globe, Mail, MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import type { Casa } from '@/features/casas/domain/Casa';
import { useSalvarPerfil } from '../hooks/usePainel';

interface Props {
  casa: Casa;
}

const campoClass =
  'w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-lg text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none';

const labelClass =
  'mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground';

const textareaClass =
  'w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-base leading-relaxed text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none resize-none';

export function AbaPerfil({ casa }: Props) {
  const salvar = useSalvarPerfil(casa.id);
  const [descricao, setDescricao] = useState(casa.descricao ?? '');
  const [sacerdote, setSacerdote] = useState(casa.sacerdoteNome ?? '');
  const [antesVisita, setAntesVisita] = useState(casa.textoAntesVisita ?? '');
  const [whatsapp, setWhatsapp] = useState(casa.contato?.whatsapp ?? '');
  const [telefone, setTelefone] = useState(casa.contato?.telefone ?? '');
  const [email, setEmail] = useState(casa.contato?.email ?? '');
  const [site, setSite] = useState(casa.contato?.site ?? '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    salvar.mutate({
      descricao: descricao.trim() || null,
      sacerdoteNome: sacerdote.trim() || null,
      textoAntesVisita: antesVisita.trim() || null,
      whatsapp: whatsapp.trim() || null,
      telefone: telefone.trim() || null,
      emailContato: email.trim() || null,
      site: site.trim() || null,
    });
  };

  return (
    <form onSubmit={submit}>

      {/* 01 — SACERDÓCIO */}
      <section className="grid gap-6 border-b border-border pb-10 md:grid-cols-[140px_1fr]">
        <div className="flex items-baseline gap-3 md:flex-col md:gap-1 md:pt-1">
          <span className="font-mono text-3xl font-light text-primary/50 md:text-4xl">01</span>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Sacerdócio
          </p>
        </div>
        <div>
          <label htmlFor="p-sacerdote" className={labelClass}>
            Nome do(a) sacerdote
          </label>
          <input
            id="p-sacerdote"
            value={sacerdote}
            onChange={(e) => setSacerdote(e.target.value)}
            placeholder="Ex.: Mãe Maria de Oxóssi"
            className={campoClass}
          />
          <p className="mt-3 text-xs text-muted-foreground">
            Aparece em destaque na ficha pública como assinatura da casa.
          </p>
        </div>
      </section>

      {/* 02 — SOBRE A CASA */}
      <section className="grid gap-6 border-b border-border py-10 md:grid-cols-[140px_1fr]">
        <div className="flex items-baseline gap-3 md:flex-col md:gap-1 md:pt-1">
          <span className="font-mono text-3xl font-light text-primary/50 md:text-4xl">02</span>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Sobre a casa
          </p>
        </div>
        <div className="space-y-8">
          <div>
            <label htmlFor="p-desc" className={labelClass}>
              Apresentação
            </label>
            <textarea
              id="p-desc"
              rows={6}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="História, linhagem, tradição praticada, dias de gira…"
              className={textareaClass}
            />
          </div>
          <div>
            <label htmlFor="p-antes" className={labelClass}>
              Antes da primeira visita
            </label>
            <textarea
              id="p-antes"
              rows={4}
              value={antesVisita}
              onChange={(e) => setAntesVisita(e.target.value)}
              placeholder="Roupa, horário, postura — o que quem chega pela primeira vez precisa saber."
              className={textareaClass}
            />
            <p className="mt-3 text-xs text-muted-foreground">
              Aparece em bloco destacado na ficha pública.
            </p>
          </div>
        </div>
      </section>

      {/* 03 — CONTATO */}
      <section className="grid gap-6 py-10 md:grid-cols-[140px_1fr]">
        <div className="flex items-baseline gap-3 md:flex-col md:gap-1 md:pt-1">
          <span className="font-mono text-3xl font-light text-primary/50 md:text-4xl">03</span>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Contato
          </p>
        </div>
        <div className="space-y-7">
          <p className="text-sm text-muted-foreground">
            Apenas os canais preenchidos aparecem na ficha pública.
          </p>
          <div className="grid gap-7 sm:grid-cols-2">
            <div>
              <label htmlFor="p-wa" className={`${labelClass} flex items-center gap-1.5`}>
                <MessageCircle className="h-3 w-3" />
                WhatsApp
              </label>
              <input
                id="p-wa"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(47) 9 0000-0000"
                className={campoClass}
              />
            </div>
            <div>
              <label htmlFor="p-tel" className={`${labelClass} flex items-center gap-1.5`}>
                <Phone className="h-3 w-3" />
                Telefone
              </label>
              <input
                id="p-tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(47) 0000-0000"
                className={campoClass}
              />
            </div>
            <div>
              <label htmlFor="p-mail" className={`${labelClass} flex items-center gap-1.5`}>
                <Mail className="h-3 w-3" />
                Email
              </label>
              <input
                id="p-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="casa@exemplo.com"
                className={campoClass}
              />
            </div>
            <div>
              <label htmlFor="p-site" className={`${labelClass} flex items-center gap-1.5`}>
                <Globe className="h-3 w-3" />
                Site ou Linktree
              </label>
              <input
                id="p-site"
                type="url"
                placeholder="https://"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className={campoClass}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-border pt-8 space-y-4">
        {salvar.error ? (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
          >
            {salvar.error.message}
          </p>
        ) : null}

        {salvar.isSuccess ? (
          <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
            <Check className="h-4 w-4 shrink-0" />
            Perfil salvo com sucesso.
          </div>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          disabled={salvar.isPending}
          className="w-full sm:w-auto"
        >
          {salvar.isPending ? 'Salvando…' : 'Salvar perfil'}
        </Button>
      </div>
    </form>
  );
}
