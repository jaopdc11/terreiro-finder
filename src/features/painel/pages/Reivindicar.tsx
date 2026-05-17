import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { useCasa } from '@/features/casas/hooks/useCasa';
import { novaReivindicacaoSchema, type NovaReivindicacaoInput } from '../schemas';
import { useReivindicar } from '../hooks/useReivindicar';

export function Reivindicar() {
  const [params] = useSearchParams();
  const slug = params.get('casa') ?? '';
  const { data: casa, isLoading: carregandoCasa } = useCasa(slug || undefined);
  const mutation = useReivindicar();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NovaReivindicacaoInput>({
    resolver: zodResolver(novaReivindicacaoSchema),
  });

  useEffect(() => {
    if (casa) setValue('casa_id', casa.id);
  }, [casa, setValue]);

  const onSubmit = handleSubmit(async (v) => {
    await mutation.mutateAsync(v);
  });

  if (!slug) {
    return (
      <section className="container max-w-xl py-12">
        <h1 className="font-display text-3xl">Qual casa você reivindica?</h1>
        <p className="mt-2 text-muted-foreground">
          Abre a ficha de uma casa não verificada e clica em <strong>Reivindique aqui</strong>.
        </p>
        <Link to="/" className="mt-6 inline-block text-primary hover:underline">
          Voltar pra busca
        </Link>
      </section>
    );
  }

  if (carregandoCasa) {
    return (
      <div className="container py-12 text-muted-foreground" role="status">
        Carregando casa…
      </div>
    );
  }

  if (!casa) {
    return (
      <section className="container max-w-xl py-12">
        <h1 className="font-display text-3xl">Casa não encontrada</h1>
        <Link to="/" className="mt-6 inline-block text-primary hover:underline">
          Voltar pra busca
        </Link>
      </section>
    );
  }

  if (casa.estaVerificada()) {
    return (
      <section className="container max-w-xl py-12">
        <h1 className="font-display text-3xl">Casa já está verificada</h1>
        <p className="mt-2 text-muted-foreground">
          Esta casa já tem dirigência cadastrada. Se você é da casa e precisa de
          acesso, escreve pro suporte.
        </p>
        <Link to={`/casa/${casa.slug.toString()}`} className="mt-6 inline-block text-primary hover:underline">
          Voltar pra ficha
        </Link>
      </section>
    );
  }

  if (mutation.isSuccess) {
    return (
      <section className="container max-w-xl py-12">
        <h1 className="font-display text-3xl">Pedido recebido. Axé.</h1>
        <p className="mt-3 text-muted-foreground">
          Vamos contatar a casa pelo canal que está registrado e confirmar antes de
          te dar acesso. Você recebe um email quando for aprovada.
        </p>
        <Link to={`/casa/${casa.slug.toString()}`} className="mt-6 inline-block text-primary hover:underline">
          Voltar pra ficha
        </Link>
      </section>
    );
  }

  return (
    <section className="container max-w-xl py-12">
      <h1 className="font-display text-3xl">Reivindicar {casa.nome}</h1>
      <p className="mt-2 text-muted-foreground">
        Você é da dirigência? Conta um pouco — vamos confirmar pelo canal já
        registrado da casa antes de aprovar.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <input type="hidden" {...register('casa_id')} />

        <div className="space-y-1">
          <Label htmlFor="rei-obs">Conta sua história com a casa</Label>
          <textarea
            id="rei-obs"
            rows={6}
            placeholder="Ex.: Sou Mãe-de-santo principal desde 2018, fui iniciada pela Mãe Joana, etc."
            {...register('observacoes')}
            aria-invalid={!!errors.observacoes}
            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
          {errors.observacoes ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.observacoes.message}
            </p>
          ) : null}
        </div>

        {mutation.error ? (
          <p role="alert" className="text-sm text-destructive">
            {mutation.error.message}
          </p>
        ) : null}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Enviando…' : 'Enviar reivindicação'}
        </Button>
      </form>
    </section>
  );
}
