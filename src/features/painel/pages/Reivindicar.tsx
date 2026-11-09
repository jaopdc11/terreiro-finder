import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { useCasa } from '@/features/casas/hooks/useCasa';
import { novaReivindicacaoSchema, type NovaReivindicacaoInput } from '../schemas';
import { useReivindicar } from '../hooks/useReivindicar';

const TA =
  'w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-base leading-relaxed text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none resize-none';
const L =
  'mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground';

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
        <p className="eyebrow eyebrow-ornado inline-flex items-center">Reivindicação</p>
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
      <section className="container max-w-2xl py-16">
        <p className="eyebrow eyebrow-ornado inline-flex items-center">Confirmação</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Pedido recebido. Axé.
        </h1>
        <p className="mt-4 text-muted-foreground">
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
      </section>
    );
  }

  return (
    <section className="container max-w-5xl py-12">
      <div className="grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-20">

        {/* ── Editorial ── */}
        <div className="lg:sticky lg:top-24 lg:self-start space-y-8">
          <div>
            <p className="eyebrow eyebrow-ornado inline-flex items-center">Reivindicação</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight lg:text-5xl">
              Reivindicar{' '}
              <span className="display-serif italic text-primary">{casa.nome}</span>
            </h1>
            <p className="mt-4 text-muted-foreground">
              Você é da dirigência? Conta um pouco — confirmamos pelo canal
              já registrado antes de liberar o acesso.
            </p>
          </div>

          <ul className="space-y-5">
            {[
              ['01', 'Você escreve', 'Como chegou à casa e qual seu papel na dirigência.'],
              ['02', 'A gente verifica', 'Contatamos pelo canal já cadastrado da casa — Instagram, WhatsApp, telefone.'],
              ['03', 'Acesso liberado', 'Aprovada a reivindicação, você vira dirigente e pode editar a ficha.'],
            ].map(([num, titulo, desc]) => (
              <li key={num} className="flex items-start gap-4">
                <span className="font-mono text-2xl font-light leading-none text-primary/40">{num}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{titulo}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Formulário ── */}
        <div>
          <form onSubmit={onSubmit} className="space-y-8" noValidate>
            <input type="hidden" {...register('casa_id')} />

            <div>
              <label htmlFor="rei-obs" className={L}>
                Sua história com a casa
              </label>
              <textarea
                id="rei-obs"
                rows={7}
                placeholder="Ex.: Sou Mãe de Santo principal desde 2018, iniciada pela Mãe Joana…"
                {...register('observacoes')}
                aria-invalid={!!errors.observacoes}
                className={TA}
              />
              {errors.observacoes ? (
                <p role="alert" className="mt-1.5 text-xs text-destructive">
                  {errors.observacoes.message}
                </p>
              ) : null}
            </div>

            {mutation.error ? (
              <p
                role="alert"
                className="text-sm text-destructive"
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
              {isSubmitting ? 'Enviando…' : 'Enviar reivindicação'}
            </Button>
          </form>
        </div>

      </div>
    </section>
  );
}
