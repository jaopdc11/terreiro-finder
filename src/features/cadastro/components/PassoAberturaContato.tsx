import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  MapPin,
  Lock,
  EyeOff,
  Globe,
  Calendar,
  Users,
  Camera,
  AlertCircle,
  CameraOff,
  MessageCircle,
  Phone,
  Mail,
  Check,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  passoAberturaContatoSchema,
  type PassoAberturaContatoInput,
} from '../schemas';

interface OpcaoRadio {
  v: string;
  label: string;
  desc: string;
  Icon: LucideIcon;
}

const ENDERECO: OpcaoRadio[] = [
  { v: 'publico', label: 'Público', desc: 'Endereço completo visível na ficha.', Icon: MapPin },
  { v: 'sob_contato', label: 'Sob contato', desc: 'Compartilhado só após contato.', Icon: Lock },
  { v: 'oculto', label: 'Oculto', desc: 'Não aparece na ficha pública.', Icon: EyeOff },
];

const VISITANTES: OpcaoRadio[] = [
  { v: 'aberto', label: 'Aberto', desc: 'Qualquer pessoa pode visitar.', Icon: Globe },
  { v: 'jogo_previo', label: 'Jogo prévio', desc: 'Primeiro passo é uma consulta.', Icon: Calendar },
  { v: 'so_indicacao', label: 'Só por indicação', desc: 'Acesso mediante referência.', Icon: Users },
];

const FOTO: OpcaoRadio[] = [
  { v: 'permitido', label: 'Permitida', desc: 'Fotos livres durante as giras.', Icon: Camera },
  { v: 'parcial', label: 'Com restrições', desc: 'Pergunte antes de fotografar.', Icon: AlertCircle },
  { v: 'proibido', label: 'Proibida', desc: 'Nenhuma foto dentro da casa.', Icon: CameraOff },
];

interface Props {
  inicial: Partial<PassoAberturaContatoInput>;
  onVoltar(): void;
  onSubmit(v: PassoAberturaContatoInput): void;
  carregando: boolean;
  erroServidor: string | null;
}

export function PassoAberturaContato({
  inicial,
  onVoltar,
  onSubmit,
  carregando,
  erroServidor,
}: Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PassoAberturaContatoInput>({
    resolver: zodResolver(passoAberturaContatoSchema),
    defaultValues: {
      endereco_visibilidade: 'sob_contato',
      aceita_visitantes: 'jogo_previo',
      foto_registro: 'parcial',
      ...inicial,
    },
  });

  const enderecoAtual = watch('endereco_visibilidade');
  const visitantesAtual = watch('aceita_visitantes');
  const fotoAtual = watch('foto_registro');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>

      {/* ── Visibilidade do endereço ── */}
      <section className="space-y-4">
        <p className="eyebrow">Endereço público</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {ENDERECO.map((o) => {
            const ativo = enderecoAtual === o.v;
            return (
              <label
                key={o.v}
                className={`group relative flex cursor-pointer flex-col gap-3 rounded-lg border p-4 transition-all ${
                  ativo
                    ? 'border-primary bg-primary/5 shadow-soft'
                    : 'border-border bg-card hover:border-foreground/20 hover:shadow-soft'
                }`}
              >
                <input
                  type="radio"
                  value={o.v}
                  {...register('endereco_visibilidade')}
                  className="sr-only"
                />
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                      ativo ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <o.Icon className="h-4 w-4" />
                  </div>
                  {ativo && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                      <Check className="h-2.5 w-2.5 text-primary-foreground" />
                    </span>
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${ativo ? 'text-primary' : 'text-foreground'}`}>
                    {o.label}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{o.desc}</p>
                </div>
              </label>
            );
          })}
        </div>
      </section>

      <div className="border-t border-border" />

      {/* ── Política de visitas ── */}
      <section className="space-y-4">
        <p className="eyebrow">Aceita visitantes</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {VISITANTES.map((o) => {
            const ativo = visitantesAtual === o.v;
            return (
              <label
                key={o.v}
                className={`group relative flex cursor-pointer flex-col gap-3 rounded-lg border p-4 transition-all ${
                  ativo
                    ? 'border-primary bg-primary/5 shadow-soft'
                    : 'border-border bg-card hover:border-foreground/20 hover:shadow-soft'
                }`}
              >
                <input
                  type="radio"
                  value={o.v}
                  {...register('aceita_visitantes')}
                  className="sr-only"
                />
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                      ativo ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <o.Icon className="h-4 w-4" />
                  </div>
                  {ativo && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                      <Check className="h-2.5 w-2.5 text-primary-foreground" />
                    </span>
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${ativo ? 'text-primary' : 'text-foreground'}`}>
                    {o.label}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{o.desc}</p>
                </div>
              </label>
            );
          })}
        </div>
      </section>

      <div className="border-t border-border" />

      {/* ── Registro de imagem ── */}
      <section className="space-y-4">
        <p className="eyebrow">Registro de imagem</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {FOTO.map((o) => {
            const ativo = fotoAtual === o.v;
            return (
              <label
                key={o.v}
                className={`group relative flex cursor-pointer flex-col gap-3 rounded-lg border p-4 transition-all ${
                  ativo
                    ? 'border-primary bg-primary/5 shadow-soft'
                    : 'border-border bg-card hover:border-foreground/20 hover:shadow-soft'
                }`}
              >
                <input
                  type="radio"
                  value={o.v}
                  {...register('foto_registro')}
                  className="sr-only"
                />
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                      ativo ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <o.Icon className="h-4 w-4" />
                  </div>
                  {ativo && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                      <Check className="h-2.5 w-2.5 text-primary-foreground" />
                    </span>
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${ativo ? 'text-primary' : 'text-foreground'}`}>
                    {o.label}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{o.desc}</p>
                </div>
              </label>
            );
          })}
        </div>
      </section>

      <div className="border-t border-border" />

      {/* ── Canais de contato ── */}
      <section className="space-y-5">
        <div>
          <p className="eyebrow">Como te contatar</p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Preencha pelo menos um canal — aparece direto na ficha pública.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <label htmlFor="c-wa" className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <MessageCircle className="h-3 w-3" />
              WhatsApp
            </label>
            <input id="c-wa" {...register('whatsapp')} placeholder="(47) 9XXXX-XXXX"
              className="w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-lg text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label htmlFor="c-tel" className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <Phone className="h-3 w-3" />
              Telefone
            </label>
            <input id="c-tel" {...register('telefone')} placeholder="(47) 3XXX-XXXX"
              className="w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-lg text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label htmlFor="c-mail" className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <Mail className="h-3 w-3" />
              Email
            </label>
            <input id="c-mail" type="email" {...register('email_contato')} placeholder="casa@exemplo.com"
              className="w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-lg text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none" />
          </div>
        </div>

        <div>
          <label htmlFor="c-site" className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            <Globe className="h-3 w-3" />
            Site da casa{' '}
            <span className="normal-case text-muted-foreground/60">(opcional)</span>
          </label>
          <input
            id="c-site"
            type="url"
            placeholder="https://linktr.ee/minhacasa"
            {...register('site')}
            className="w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-lg text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none"
          />
          {errors.site ? (
            <p role="alert" className="mt-1.5 text-xs text-destructive">{errors.site.message}</p>
          ) : null}
        </div>

        {(errors as Record<string, unknown>)[''] ? (
          <p role="alert" className="text-sm text-destructive">
            {(errors as Record<string, { message?: string }>)['']?.message}
          </p>
        ) : null}
      </section>

      <div className="border-t border-border" />

      {/* ── Antes da primeira visita ── */}
      <section className="space-y-3">
        <p className="eyebrow">
          Antes da primeira visita{' '}
          <span className="ml-1 text-xs font-normal normal-case tracking-normal text-muted-foreground">
            (opcional)
          </span>
        </p>
        <textarea
          id="c-antes"
          rows={4}
          {...register('texto_antes_visita')}
          placeholder="Roupa, horário, postura — o que quem chega precisa saber."
          className="w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-sm leading-relaxed text-foreground transition-colors placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none resize-none"
        />
        {errors.texto_antes_visita ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.texto_antes_visita.message}
          </p>
        ) : null}
      </section>

      <div className="border-t border-border" />

      {/* ── Consentimento ── */}
      <section>
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-muted/40 p-4 transition-colors hover:border-foreground/20">
          <input
            type="checkbox"
            {...register('consentimento')}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
          />
          <span className="text-sm leading-relaxed text-foreground/80">
            Confirmo que sou da dirigência desta casa e autorizo a publicação das
            informações acima, sabendo que poderei editar ou solicitar arquivamento a
            qualquer momento. Li a{' '}
            <Link
              to="/politica"
              target="_blank"
              rel="noreferrer"
              className="link-underline text-primary"
            >
              política de privacidade
            </Link>
            .
          </span>
        </label>
        {errors.consentimento ? (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {errors.consentimento.message}
          </p>
        ) : null}
      </section>

      {erroServidor ? (
        <p role="alert" className="text-sm text-destructive">{erroServidor}</p>
      ) : null}

      <div className="flex justify-between pt-2">
        <Button type="button" variant="ghost" onClick={onVoltar}>← Voltar</Button>
        <Button type="submit" variant="primary" disabled={carregando}>
          {carregando ? 'Enviando…' : 'Enviar cadastro'}
        </Button>
      </div>
    </form>
  );
}
