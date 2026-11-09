import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Riscos } from '@/shared/components/ornamentos/Ornamentos';
import { novaIndicacaoSchema, type NovaIndicacaoInput } from '../schemas';
import { useIndicar } from '../hooks/useIndicar';

const TRADICOES = [
  { v: 'umbanda', label: 'Umbanda' },
  { v: 'candomble', label: 'Candomblé' },
  { v: 'quimbanda', label: 'Quimbanda' },
  { v: 'omoloco', label: 'Omolocô' },
  { v: 'xamba', label: 'Xambá' },
  { v: 'outra', label: 'Outra' },
] as const;

const campoClass =
  'w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-lg text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none';

const labelClass =
  'mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground';

const textareaClass =
  'w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-base text-foreground leading-relaxed transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none resize-none';

export function Indicar() {
  const mutation = useIndicar();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NovaIndicacaoInput>({
    resolver: zodResolver(novaIndicacaoSchema),
  });

  const onSubmit = handleSubmit(async (v) => {
    await mutation.mutateAsync(v);
    reset();
  });

  if (mutation.isSuccess) {
    return (
      <section className="hero-gradient min-h-[calc(100vh-4rem)]">
        <div className="container flex max-w-2xl flex-col items-center py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <p className="eyebrow eyebrow-ornado mt-8 inline-flex items-center">
            Confirmação
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Indicação registrada.{' '}
            <span className="display-serif italic text-primary">Axé.</span>
          </h1>
          <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">
            Entraremos em contato com a casa pelo canal informado. A ficha só
            será publicada após a{' '}
            <strong className="text-foreground">
              autorização da dirigência
            </strong>
            .
          </p>
          <Riscos
            className="mx-auto my-8 h-3 w-24"
            accent="hsl(var(--terra-pemba))"
          />
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/mapa">
              <Button variant="outline">Voltar ao mapa</Button>
            </Link>
            <Button variant="ghost" onClick={() => mutation.reset()}>
              Indicar outra casa
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] border-b border-border">
      <div className="container max-w-6xl py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-20">

          {/* ── Sidebar editorial ── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="eyebrow eyebrow-ornado inline-flex items-center">
              Indicação
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Indicar uma{' '}
              <em className="display-serif italic text-primary">casa</em>.
            </h1>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Conhece um terreiro que ainda não está no mapa? Envie aqui.
              Entramos em contato antes de publicar — a casa decide se quer
              aparecer.
            </p>

            <Riscos
              className="my-8 h-3 w-20"
              accent="hsl(var(--terra-pemba))"
            />

            <ul className="space-y-5">
              {[
                {
                  n: '01',
                  t: 'A casa autoriza',
                  d: 'A ficha só vai ao ar depois que a dirigência confirmar.',
                },
                {
                  n: '02',
                  t: 'Contato cruzado',
                  d: 'Usamos o canal que você informar. O dado não é publicado.',
                },
                {
                  n: '03',
                  t: 'Você só indica',
                  d: 'Sem burocracia do seu lado. A gente cuida do contato.',
                },
              ].map((p) => (
                <li key={p.n} className="flex gap-4">
                  <span className="pt-0.5 font-mono text-xs text-primary">
                    {p.n}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {p.t}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {p.d}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Formulário ── */}
          <form onSubmit={onSubmit} className="space-y-0" noValidate>

            {/* Seção: A casa */}
            <section className="space-y-8 pb-10">
              <p className="eyebrow">A casa</p>

              <div>
                <label htmlFor="ind-nome" className={labelClass}>
                  Nome da casa
                </label>
                <input
                  id="ind-nome"
                  {...register('nome')}
                  aria-invalid={!!errors.nome}
                  placeholder="Ex.: Tenda Pai João de Aruanda"
                  className={campoClass}
                />
                {errors.nome ? (
                  <p role="alert" className="mt-1.5 text-xs text-destructive">
                    {errors.nome.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <label htmlFor="ind-cidade" className={labelClass}>
                    Cidade
                  </label>
                  <input
                    id="ind-cidade"
                    placeholder="Itajaí"
                    {...register('cidade')}
                    aria-invalid={!!errors.cidade}
                    className={campoClass}
                  />
                  {errors.cidade ? (
                    <p role="alert" className="mt-1.5 text-xs text-destructive">
                      {errors.cidade.message}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="ind-estado" className={labelClass}>
                    UF
                  </label>
                  <input
                    id="ind-estado"
                    placeholder="SC"
                    maxLength={2}
                    {...register('estado')}
                    aria-invalid={!!errors.estado}
                    className={`${campoClass} uppercase`}
                  />
                  {errors.estado ? (
                    <p role="alert" className="mt-1.5 text-xs text-destructive">
                      {errors.estado.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <label htmlFor="ind-bairro" className={labelClass}>
                  Bairro{' '}
                  <span className="normal-case text-muted-foreground/60">
                    (opcional)
                  </span>
                </label>
                <input
                  id="ind-bairro"
                  {...register('bairro')}
                  className={campoClass}
                />
              </div>
            </section>

            <div className="border-t border-border" />

            {/* Seção: Sobre a casa */}
            <section className="space-y-8 py-10">
              <p className="eyebrow">Sobre a casa</p>

              <div>
                <label htmlFor="ind-tradicao" className={labelClass}>
                  Tradição
                </label>
                <select
                  id="ind-tradicao"
                  {...register('tradicao_principal')}
                  className="w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-lg text-foreground transition-colors focus:border-primary focus:outline-none"
                >
                  <option value="">Prefiro não informar</option>
                  {TRADICOES.map((t) => (
                    <option key={t.v} value={t.v}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="ind-canal" className={labelClass}>
                  Canal de contato da casa
                </label>
                <input
                  id="ind-canal"
                  placeholder="Ex.: Instagram @casa-da-aruanda, WhatsApp da Mãe Maria"
                  {...register('canal_contato')}
                  aria-invalid={!!errors.canal_contato}
                  className={campoClass}
                />
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  Utilizamos esse canal pra solicitar autorização à dirigência.
                  O dado não é publicado.
                </p>
                {errors.canal_contato ? (
                  <p role="alert" className="mt-1.5 text-xs text-destructive">
                    {errors.canal_contato.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="ind-obs" className={labelClass}>
                  Observações{' '}
                  <span className="normal-case text-muted-foreground/60">
                    (opcional)
                  </span>
                </label>
                <textarea
                  id="ind-obs"
                  rows={3}
                  {...register('observacoes')}
                  placeholder="Informações extras que possam ajudar no contato…"
                  className={textareaClass}
                />
              </div>
            </section>

            <div className="border-t border-border pt-8">
              {mutation.error ? (
                <p
                  role="alert"
                  className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-2.5 text-sm text-destructive"
                >
                  {mutation.error.message}
                </p>
              ) : null}

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? 'Enviando…' : 'Enviar indicação'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
