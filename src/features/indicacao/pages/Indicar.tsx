import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
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
      <section className="container max-w-xl py-16">
        <div className="card-soft p-8 text-center">
          <p className="eyebrow">Confirmação</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Indicação registrada. Axé.
          </h1>
          <p className="mt-3 text-muted-foreground">
            Entraremos em contato com a casa pelo canal informado. A ficha só
            será publicada após a autorização da dirigência.
          </p>
          <div className="mt-6 flex justify-center gap-6 text-sm">
            <Link
              to="/mapa"
              className="font-medium text-foreground hover:underline"
            >
              Voltar ao mapa
            </Link>
            <button
              type="button"
              className="font-medium text-foreground hover:underline"
              onClick={() => mutation.reset()}
            >
              Indicar outra casa
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container max-w-xl py-12">
      <header>
        <p className="eyebrow">Indicação</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Indicar uma casa
        </h1>
        <p className="mt-3 text-muted-foreground">
          Conhece um terreiro que ainda não está cadastrado? Envie aqui.{' '}
          <strong className="text-foreground">
            A ficha só vai ao ar após a dirigência autorizar
          </strong>{' '}
          — entraremos em contato pelo canal informado.
        </p>
      </header>

      <form onSubmit={onSubmit} className="card-soft mt-8 space-y-5 p-6" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="ind-nome">Nome da casa</Label>
          <Input
            id="ind-nome"
            {...register('nome')}
            aria-invalid={!!errors.nome}
          />
          {errors.nome ? (
            <p role="alert" className="text-xs text-destructive">
              {errors.nome.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ind-cidade">Cidade</Label>
            <Input
              id="ind-cidade"
              defaultValue="Itajaí"
              {...register('cidade')}
              aria-invalid={!!errors.cidade}
            />
            {errors.cidade ? (
              <p role="alert" className="text-xs text-destructive">
                {errors.cidade.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ind-estado">Estado (sigla)</Label>
            <Input
              id="ind-estado"
              defaultValue="SC"
              maxLength={2}
              {...register('estado')}
              aria-invalid={!!errors.estado}
            />
            {errors.estado ? (
              <p role="alert" className="text-xs text-destructive">
                {errors.estado.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ind-bairro">Bairro (opcional)</Label>
          <Input
            id="ind-bairro"
            {...register('bairro')}
            aria-invalid={!!errors.bairro}
          />
          {errors.bairro ? (
            <p role="alert" className="text-xs text-destructive">
              {errors.bairro.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ind-tradicao">Tradição (se souber)</Label>
          <select
            id="ind-tradicao"
            {...register('tradicao_principal')}
            className="flex h-9 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground shadow-xs focus:border-primary focus:outline-none"
          >
            <option value="">Prefiro não informar</option>
            {TRADICOES.map((t) => (
              <option key={t.v} value={t.v}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ind-canal">Canal de contato da casa</Label>
          <Input
            id="ind-canal"
            placeholder="Ex.: Instagram @casa-da-aruanda, WhatsApp da Mãe Maria"
            {...register('canal_contato')}
            aria-invalid={!!errors.canal_contato}
          />
          <p className="text-xs text-muted-foreground">
            Utilizamos este canal para solicitar autorização à dirigência. O
            dado não é publicado.
          </p>
          {errors.canal_contato ? (
            <p role="alert" className="text-xs text-destructive">
              {errors.canal_contato.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ind-obs">Observações (opcional)</Label>
          <textarea
            id="ind-obs"
            rows={3}
            {...register('observacoes')}
            className="flex w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground shadow-xs focus:border-primary focus:outline-none"
          />
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
          {isSubmitting ? 'Enviando…' : 'Enviar indicação'}
        </Button>
      </form>
    </section>
  );
}
