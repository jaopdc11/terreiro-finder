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
      <section className="container max-w-xl py-16">
        <p className="eyebrow">Reivindicação</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Qual casa você reivindica?
        </h1>
        <p className="mt-3 text-muted-foreground">
          Abra a ficha de uma casa não verificada e clique em{' '}
          <strong>Reivindique aqui</strong>.
        </p>
        <Link
          to="/mapa"
          className="mt-6 inline-block text-sm font-medium text-foreground hover:underline"
        >
          Voltar ao mapa →
        </Link>
      </section>
    );
  }

  if (carregandoCasa) {
    return (
      <div className="container py-16 text-sm text-muted-foreground" role="status">
        Carregando casa…
      </div>
    );
  }

  if (!casa) {
    return (
      <section className="container max-w-xl py-16">
        <h1 className="text-3xl font-semibold tracking-tight">
          Casa não encontrada.
        </h1>
        <Link
          to="/mapa"
          className="mt-6 inline-block text-sm font-medium text-foreground hover:underline"
        >
          Voltar ao mapa →
        </Link>
      </section>
    );
  }

  if (casa.estaVerificada()) {
    return (
      <section className="container max-w-xl py-16">
        <h1 className="text-3xl font-semibold tracking-tight">
          Casa já verificada.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Esta casa já possui dirigência cadastrada. Caso você seja da casa e
          precise de acesso, entre em contato com o suporte.
        </p>
        <Link
          to={`/casa/${casa.slug.toString()}`}
          className="mt-6 inline-block text-sm font-medium text-foreground hover:underline"
        >
          Voltar à ficha →
        </Link>
      </section>
    );
  }

  if (mutation.isSuccess) {
    return (
      <section className="container max-w-xl py-16">
        <div className="card-soft p-8">
          <p className="eyebrow">Confirmação</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Pedido recebido. Axé.
          </h1>
          <p className="mt-3 text-muted-foreground">
            Entraremos em contato com a casa pelo canal registrado para
            confirmar antes de liberar o acesso. Você receberá um email
            quando a reivindicação for aprovada.
          </p>
          <Link
            to={`/casa/${casa.slug.toString()}`}
            className="mt-6 inline-block text-sm font-medium text-foreground hover:underline"
          >
            Voltar à ficha →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container max-w-xl py-12">
      <header>
        <p className="eyebrow">Reivindicação</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Reivindicar {casa.nome}
        </h1>
        <p className="mt-3 text-muted-foreground">
          Você é da dirigência? Conte um pouco — confirmaremos pelo canal já
          registrado da casa antes da aprovação.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="card-soft mt-8 space-y-5 p-6"
        noValidate
      >
        <input type="hidden" {...register('casa_id')} />

        <div className="space-y-1.5">
          <Label htmlFor="rei-obs">Sua história com a casa</Label>
          <textarea
            id="rei-obs"
            rows={6}
            placeholder="Ex.: Sou Mãe de Santo principal desde 2018, iniciada pela Mãe Joana…"
            {...register('observacoes')}
            aria-invalid={!!errors.observacoes}
            className="flex w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground shadow-xs focus:border-primary focus:outline-none"
          />
          {errors.observacoes ? (
            <p role="alert" className="text-xs text-destructive">
              {errors.observacoes.message}
            </p>
          ) : null}
        </div>

        {mutation.error ? (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 p-2.5 text-sm text-destructive"
          >
            {mutation.error.message}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Enviando…' : 'Enviar reivindicação'}
        </Button>
      </form>
    </section>
  );
}
