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
  } = useForm<NovaIndicacaoInput>({ resolver: zodResolver(novaIndicacaoSchema) });

  const onSubmit = handleSubmit(async (v) => {
    await mutation.mutateAsync(v);
    reset();
  });

  if (mutation.isSuccess) {
    return (
      <section className="container max-w-2xl py-24">
        <div className="border-2 border-foreground p-10 text-center">
          <p className="eyebrow text-primary">Confirmação</p>
          <h1 className="display-hero mt-6 text-4xl">
            Indicação<br />recebida.
          </h1>
          <p className="mt-6 text-foreground/75">
            Vamos contatar a casa pelo canal que você passou. A casa só aparece
            no site depois que ela autorizar.
          </p>
          <div className="mt-8 flex justify-center gap-8 text-xs font-semibold uppercase tracking-widest">
            <Link to="/" className="link-underline text-foreground">
              Voltar pra busca
            </Link>
            <button
              type="button"
              className="link-underline text-foreground"
              onClick={() => mutation.reset()}
            >
              Indicar outra
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container max-w-5xl py-20">
      <div className="grid grid-cols-12 gap-x-8">
        <header className="col-span-12 md:col-span-5">
          <p className="eyebrow text-primary">Indicação</p>
          <h1 className="display-hero mt-8 text-5xl">
            Indicar<br />uma casa.
          </h1>
          <p className="mt-6 max-w-xs text-foreground/70">
            Conhece um terreiro que ainda não está aqui? Manda pra gente.{' '}
            <strong className="text-foreground">
              A casa só aparece no site depois que a dirigência autorizar
            </strong>{' '}
            — a gente contata pelo canal que você passar.
          </p>
        </header>

        <form
          onSubmit={onSubmit}
          className="col-span-12 mt-12 space-y-7 border-t border-foreground pt-10 md:col-span-7 md:mt-0 md:border-l md:border-t-0 md:pl-8 md:pt-0"
          noValidate
        >
        <div className="space-y-1">
          <Label htmlFor="ind-nome">Nome da casa</Label>
          <Input id="ind-nome" {...register('nome')} aria-invalid={!!errors.nome} />
          {errors.nome ? <p role="alert" className="text-sm text-destructive">{errors.nome.message}</p> : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="ind-cidade">Cidade</Label>
            <Input id="ind-cidade" defaultValue="Itajaí" {...register('cidade')} aria-invalid={!!errors.cidade} />
            {errors.cidade ? <p role="alert" className="text-sm text-destructive">{errors.cidade.message}</p> : null}
          </div>
          <div className="space-y-1">
            <Label htmlFor="ind-estado">Estado (sigla)</Label>
            <Input id="ind-estado" defaultValue="SC" maxLength={2} {...register('estado')} aria-invalid={!!errors.estado} />
            {errors.estado ? <p role="alert" className="text-sm text-destructive">{errors.estado.message}</p> : null}
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="ind-bairro">Bairro (opcional)</Label>
          <Input id="ind-bairro" {...register('bairro')} aria-invalid={!!errors.bairro} />
          {errors.bairro ? <p role="alert" className="text-sm text-destructive">{errors.bairro.message}</p> : null}
        </div>

        <div className="space-y-1">
          <Label htmlFor="ind-tradicao">Tradição (se souber)</Label>
          <select
            id="ind-tradicao"
            {...register('tradicao_principal')}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Não sei dizer</option>
            {TRADICOES.map((t) => (
              <option key={t.v} value={t.v}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="ind-canal">Canal de contato da casa</Label>
          <Input
            id="ind-canal"
            placeholder="Ex.: Instagram @casa-da-aruanda, WhatsApp da Mãe Maria, etc."
            {...register('canal_contato')}
            aria-invalid={!!errors.canal_contato}
          />
          <p className="text-xs text-muted-foreground">
            A gente usa isso pra pedir autorização da dirigência. Não publicamos esse
            dado.
          </p>
          {errors.canal_contato ? (
            <p role="alert" className="text-sm text-destructive">{errors.canal_contato.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <Label htmlFor="ind-obs">Observações (opcional)</Label>
          <textarea
            id="ind-obs"
            rows={3}
            {...register('observacoes')}
            className="flex w-full border-0 border-b border-foreground/30 bg-transparent px-0 py-2 text-base focus:border-primary focus:outline-none"
          />
        </div>

        {mutation.error ? (
          <p
            role="alert"
            className="border-l-2 border-destructive pl-3 text-sm text-destructive"
          >
            {mutation.error.message}
          </p>
        ) : null}

        <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
          {isSubmitting ? 'Enviando…' : 'Enviar indicação'}
        </Button>
        </form>
      </div>
    </section>
  );
}
