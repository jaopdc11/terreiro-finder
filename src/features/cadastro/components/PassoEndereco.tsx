import { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useEnderecoPorCep } from '@/shared/hooks/useEnderecoPorCep';
import { formatarCep } from '@/shared/lib/cep';
import { passoEnderecoSchema, type PassoEnderecoInput } from '../schemas';

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

  // ViaCEP — observa o campo CEP e autopreenche o resto
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

  return (
    <form onSubmit={handleSubmit(onAvancar)} className="space-y-5" noValidate>
      <p className="text-sm text-muted-foreground">
        Digite o CEP que preenchemos o resto. O pino no mapa é calculado depois
        a partir do endereço.
      </p>

      {/* CEP em destaque */}
      <div className="space-y-1.5">
        <Label htmlFor="c-cep">CEP</Label>
        <div className="flex items-center gap-2">
          <Controller
            control={control}
            name="cep"
            render={({ field }) => (
              <Input
                id="c-cep"
                value={field.value ?? ''}
                onChange={(e) => field.onChange(formatarCep(e.target.value))}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
                placeholder="88307-000"
                inputMode="numeric"
                maxLength={9}
                className="max-w-[12rem]"
              />
            )}
          />
          {viacep.isFetching ? (
            <span className="text-xs text-muted-foreground">Buscando…</span>
          ) : viacep.isSuccess && viacep.data === null && cep.replace(/\D/g, '').length === 8 ? (
            <span className="text-xs text-destructive">CEP não encontrado</span>
          ) : viacep.isSuccess && viacep.data && !viacep.data.logradouro ? (
            <span className="text-xs text-muted-foreground">
              CEP genérico — preencha a rua manualmente
            </span>
          ) : viacep.isSuccess && viacep.data ? (
            <span className="text-xs text-primary">✓ Endereço preenchido</span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
        <div className="space-y-1.5">
          <Label htmlFor="c-log">Logradouro</Label>
          <Input id="c-log" {...register('logradouro')} placeholder="Rua das Flores" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-num">Número</Label>
          <Input id="c-num" {...register('numero')} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="c-comp">Complemento (opcional)</Label>
        <Input id="c-comp" {...register('complemento')} placeholder="Casa dos fundos, salão 2…" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="c-bairro">Bairro</Label>
          <Input id="c-bairro" {...register('bairro')} aria-invalid={!!errors.bairro} />
          {errors.bairro ? (
            <p role="alert" className="text-sm text-destructive">{errors.bairro.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-cidade">Cidade</Label>
          <Input
            id="c-cidade"
            defaultValue={inicial.cidade ?? ''}
            placeholder="Sua cidade"
            {...register('cidade')}
            aria-invalid={!!errors.cidade}
          />
          {errors.cidade ? (
            <p role="alert" className="text-sm text-destructive">{errors.cidade.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_3fr]">
        <div className="space-y-1.5">
          <Label htmlFor="c-estado">UF</Label>
          <Input
            id="c-estado"
            maxLength={2}
            defaultValue={inicial.estado ?? ''}
            placeholder="UF"
            {...register('estado')}
            aria-invalid={!!errors.estado}
          />
          {errors.estado ? (
            <p role="alert" className="text-sm text-destructive">{errors.estado.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={onVoltar}>Voltar</Button>
        <Button type="submit">Próximo</Button>
      </div>
    </form>
  );
}
