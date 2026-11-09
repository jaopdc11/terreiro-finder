import { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useEnderecoPorCep } from '@/shared/hooks/useEnderecoPorCep';
import { formatarCep } from '@/shared/lib/cep';
import { passoEnderecoSchema, type PassoEnderecoInput } from '../schemas';

const C =
  'w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-lg text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none';
const L =
  'mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground';

interface Props {
  inicial: Partial<PassoEnderecoInput>;
  onVoltar(): void;
  onAvancar(v: PassoEnderecoInput): void;
}

export function PassoEndereco({ inicial, onVoltar, onAvancar }: Props) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PassoEnderecoInput>({
    resolver: zodResolver(passoEnderecoSchema),
    defaultValues: { ...inicial, cep: formatarCep(inicial.cep ?? '') },
  });

  const cep = watch('cep') ?? '';
  const viacep = useEnderecoPorCep(cep);
  const ultimoCepAplicado = useRef<string | null>(null);

  useEffect(() => {
    const limpo = cep.replace(/\D/g, '');
    if (limpo.length !== 8 || !viacep.data) return;
    if (ultimoCepAplicado.current === limpo) return;
    ultimoCepAplicado.current = limpo;
    if (viacep.data.logradouro) setValue('logradouro', viacep.data.logradouro);
    if (viacep.data.bairro) setValue('bairro', viacep.data.bairro);
    if (viacep.data.cidade) setValue('cidade', viacep.data.cidade);
    if (viacep.data.uf) setValue('estado', viacep.data.uf);
  }, [cep, viacep.data, setValue]);

  const cepLimpo = cep.replace(/\D/g, '');
  const cepCompleto = cepLimpo.length === 8;

  return (
    <form onSubmit={handleSubmit(onAvancar)} className="space-y-10" noValidate>

      {/* ── Localização ── */}
      <section className="space-y-8">
        <p className="eyebrow">Localização</p>

        <div>
          <label htmlFor="c-cep" className={L}>CEP</label>
          <div className="flex items-center gap-4">
            <Controller
              control={control}
              name="cep"
              render={({ field }) => (
                <input
                  id="c-cep"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(formatarCep(e.target.value))}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  placeholder="88307-000"
                  inputMode="numeric"
                  maxLength={9}
                  className={`${C} max-w-[10rem]`}
                />
              )}
            />
            {viacep.isFetching ? (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Buscando…
              </span>
            ) : cepCompleto && viacep.isSuccess && viacep.data === null ? (
              <span className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                CEP não encontrado
              </span>
            ) : cepCompleto && viacep.isSuccess && viacep.data && !viacep.data.logradouro ? (
              <span className="text-xs text-muted-foreground">
                CEP genérico — preencha a rua manualmente
              </span>
            ) : cepCompleto && viacep.isSuccess && viacep.data ? (
              <span className="flex items-center gap-1.5 text-xs text-primary">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Endereço preenchido
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Digite o CEP que preenchemos o restante automaticamente.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-[2fr_1fr]">
          <div>
            <label htmlFor="c-log" className={L}>Logradouro</label>
            <input
              id="c-log"
              {...register('logradouro')}
              placeholder="Rua das Flores"
              aria-invalid={!!errors.logradouro}
              className={C}
            />
            {errors.logradouro ? (
              <p role="alert" className="mt-1.5 text-xs text-destructive">{errors.logradouro.message}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="c-num" className={L}>Número</label>
            <input
              id="c-num"
              {...register('numero')}
              aria-invalid={!!errors.numero}
              className={C}
            />
            {errors.numero ? (
              <p role="alert" className="mt-1.5 text-xs text-destructive">{errors.numero.message}</p>
            ) : null}
          </div>
        </div>

        <div>
          <label htmlFor="c-comp" className={L}>
            Complemento{' '}
            <span className="normal-case text-muted-foreground/60">(opcional)</span>
          </label>
          <input
            id="c-comp"
            {...register('complemento')}
            placeholder="Casa dos fundos, salão 2…"
            className={C}
          />
        </div>
      </section>

      <div className="border-t border-border" />

      {/* ── Cidade ── */}
      <section className="space-y-8">
        <p className="eyebrow">Cidade</p>

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <label htmlFor="c-bairro" className={L}>Bairro</label>
            <input
              id="c-bairro"
              {...register('bairro')}
              aria-invalid={!!errors.bairro}
              className={C}
            />
            {errors.bairro ? (
              <p role="alert" className="mt-1.5 text-xs text-destructive">{errors.bairro.message}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="c-cidade" className={L}>Cidade</label>
            <input
              id="c-cidade"
              placeholder="Itajaí"
              {...register('cidade')}
              aria-invalid={!!errors.cidade}
              className={C}
            />
            {errors.cidade ? (
              <p role="alert" className="mt-1.5 text-xs text-destructive">{errors.cidade.message}</p>
            ) : null}
          </div>
        </div>

        <div className="max-w-[8rem]">
          <label htmlFor="c-estado" className={L}>UF</label>
          <input
            id="c-estado"
            maxLength={2}
            placeholder="SC"
            {...register('estado')}
            aria-invalid={!!errors.estado}
            className={`${C} uppercase`}
          />
          {errors.estado ? (
            <p role="alert" className="mt-1.5 text-xs text-destructive">{errors.estado.message}</p>
          ) : null}
        </div>

        <p className="rounded-md bg-muted/60 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
          O pino no mapa é calculado a partir desse endereço. Você pode ajustar a
          posição com precisão no painel depois de aprovado.
        </p>
      </section>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="ghost" onClick={onVoltar}>← Voltar</Button>
        <Button type="submit" variant="primary">Próximo →</Button>
      </div>
    </form>
  );
}
