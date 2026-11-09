import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/button';
import { Combobox } from '@/shared/ui/combobox';
import type { TradicaoPrincipal } from '@/features/casas/schemas';
import { passoIdentidadeSchema, type PassoIdentidadeInput } from '../schemas';
import { sugestoesPapelPara } from '../sugestoesPapel';

const TRADICOES = [
  { v: 'umbanda', label: 'Umbanda' },
  { v: 'candomble', label: 'Candomblé' },
  { v: 'quimbanda', label: 'Quimbanda' },
  { v: 'omoloco', label: 'Omolocô' },
  { v: 'xamba', label: 'Xambá' },
  { v: 'outra', label: 'Outra' },
] as const;

const C =
  'w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-lg text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none';
const L =
  'mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground';
const TA =
  'w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-base leading-relaxed text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none resize-none';

interface Props {
  inicial: Partial<PassoIdentidadeInput>;
  onAvancar(v: PassoIdentidadeInput): void;
}

export function PassoIdentidade({ inicial, onAvancar }: Props) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PassoIdentidadeInput>({
    resolver: zodResolver(passoIdentidadeSchema),
    defaultValues: inicial,
  });

  const tradicaoAtual = watch('tradicao_principal') as TradicaoPrincipal | undefined;
  const sugestoesAtuais = sugestoesPapelPara(tradicaoAtual ?? null);

  return (
    <form onSubmit={handleSubmit(onAvancar)} className="space-y-10" noValidate>

      {/* ── A casa ── */}
      <section className="space-y-8">
        <p className="eyebrow">A casa</p>

        <div>
          <label htmlFor="c-nome" className={L}>Nome da casa</label>
          <input
            id="c-nome"
            {...register('nome')}
            aria-invalid={!!errors.nome}
            placeholder="Ex.: Tenda Pai João de Aruanda"
            className={C}
          />
          {errors.nome ? (
            <p role="alert" className="mt-1.5 text-xs text-destructive">{errors.nome.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="c-sacerdote" className={L}>
            Sacerdote(isa){' '}
            <span className="normal-case text-muted-foreground/60">(opcional)</span>
          </label>
          <input
            id="c-sacerdote"
            {...register('sacerdote_nome')}
            placeholder="Ex.: Mãe Maria de Oxóssi"
            className={C}
          />
        </div>
      </section>

      <div className="border-t border-border" />

      {/* ── Tradição ── */}
      <section className="space-y-6">
        <p className="eyebrow">Tradição</p>

        <Controller
          control={control}
          name="tradicao_principal"
          render={({ field }) => (
            <div className="space-y-3">
              <p className={L}>Tradição principal</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {TRADICOES.map((t) => {
                  const selecionada = field.value === t.v;
                  return (
                    <button
                      key={t.v}
                      type="button"
                      onClick={() => field.onChange(t.v)}
                      className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all ${
                        selecionada
                          ? 'border-primary bg-primary/5 text-primary shadow-soft'
                          : 'border-border bg-card text-foreground hover:border-foreground/25 hover:shadow-soft'
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
              {errors.tradicao_principal ? (
                <p role="alert" className="text-xs text-destructive">
                  {errors.tradicao_principal.message}
                </p>
              ) : null}
            </div>
          )}
        />

        <div>
          <label htmlFor="c-papel" className={L}>Como você é chamada(o) na casa?</label>
          <Controller
            control={control}
            name="papel_dirigencia"
            render={({ field }) => (
              <Combobox
                id="c-papel"
                value={field.value ?? ''}
                onChange={field.onChange}
                sugestoes={sugestoesAtuais}
                placeholder="Ex.: Mãe de Santo, Babalorixá, Tata"
                aria-invalid={!!errors.papel_dirigencia}
              />
            )}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Use o termo que a sua casa adota — as sugestões são só guia. Esse título
            aparece na ficha pública.
          </p>
          {errors.papel_dirigencia ? (
            <p role="alert" className="mt-1.5 text-xs text-destructive">{errors.papel_dirigencia.message}</p>
          ) : null}
        </div>
      </section>

      <div className="border-t border-border" />

      {/* ── Contexto ── */}
      <section className="space-y-8">
        <p className="eyebrow">Contexto</p>

        <div>
          <label htmlFor="c-desc" className={L}>
            Sobre a casa{' '}
            <span className="normal-case text-muted-foreground/60">(opcional)</span>
          </label>
          <textarea
            id="c-desc"
            rows={4}
            {...register('descricao')}
            placeholder="História, linhagem, dia de gira…"
            className={TA}
          />
        </div>

        <div>
          <label htmlFor="c-validacao" className={L}>Como podemos validar sua dirigência?</label>
          <textarea
            id="c-validacao"
            rows={3}
            {...register('canal_validacao')}
            aria-invalid={!!errors.canal_validacao}
            placeholder='Ex.: "Instagram @minhacasa", "WhatsApp (47) 9XXXX — pergunte pela Mãe Maria"'
            className={TA}
          />
          <p className="mt-3 rounded-md bg-muted/60 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
            Contatamos por esse canal antes de aprovar — é assim que a casa sai{' '}
            <strong className="text-foreground">verificada</strong>. Sem prova externa
            de dirigência, o cadastro vira indicação comum.
          </p>
          {errors.canal_validacao ? (
            <p role="alert" className="mt-1.5 text-xs text-destructive">{errors.canal_validacao.message}</p>
          ) : null}
        </div>
      </section>

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary">Próximo →</Button>
      </div>
    </form>
  );
}
