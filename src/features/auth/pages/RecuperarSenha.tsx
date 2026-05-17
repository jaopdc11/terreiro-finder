import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { CampoForm } from '../components/CampoForm';
import { recuperarSenhaSchema, type RecuperarSenhaInput } from '../schemas';
import { useAuth } from '../hooks/useAuth';

export function RecuperarSenha() {
  const auth = useAuth();
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecuperarSenhaInput>({ resolver: zodResolver(recuperarSenhaSchema) });

  const onSubmit = handleSubmit(async ({ email }) => {
    setErro(null);
    try {
      await auth.recuperarSenha(email, `${window.location.origin}/login`);
      setEnviado(true);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falhou enviar o link.');
    }
  });

  if (enviado) {
    return (
      <section className="container max-w-md py-14 text-center">
        <div className="card-surface p-8">
          <span className="inline-block text-3xl" aria-hidden="true">
            ✉
          </span>
          <h1 className="mt-3 font-display text-3xl">Olha o email</h1>
          <p className="mt-2 text-muted-foreground">
            Se a conta existe, mandamos um link pra você refazer a senha.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block text-sm text-primary underline-offset-4 hover:underline"
          >
            Voltar pra entrar
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container max-w-md py-14">
      <header className="space-y-2 text-center">
        <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">
          <span aria-hidden="true" className="h-1 w-6 rounded-full bg-primary" />
          Recuperação
        </p>
        <h1 className="font-display text-4xl">Esqueci a senha</h1>
        <p className="text-muted-foreground">
          Diz teu email — mandamos um link pra refazer.
        </p>
      </header>

      <form onSubmit={onSubmit} className="card-surface mt-8 space-y-5 p-6 sm:p-7" noValidate>
        <CampoForm
          label="Email"
          type="email"
          autoComplete="email"
          erro={errors.email?.message}
          {...register('email')}
        />

        {erro ? (
          <p role="alert" className="text-sm text-destructive">
            {erro}
          </p>
        ) : null}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Enviando…' : 'Enviar link'}
        </Button>
      </form>
    </section>
  );
}
