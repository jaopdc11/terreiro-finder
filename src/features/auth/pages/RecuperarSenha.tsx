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
      <section className="container max-w-2xl py-24">
        <div className="border-2 border-foreground p-10 text-center">
          <p className="eyebrow text-primary">Confirmação</p>
          <h1 className="display-hero mt-6 text-4xl">Olha o email.</h1>
          <p className="mt-6 text-foreground/75">
            Se a conta existe, mandamos um link pra você refazer a senha.
          </p>
          <Link
            to="/login"
            className="link-underline mt-8 inline-block text-sm font-semibold uppercase tracking-wider text-foreground"
          >
            Voltar pra entrar
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container max-w-5xl py-20">
      <div className="grid grid-cols-12 gap-x-8">
        <header className="col-span-12 md:col-span-5">
          <p className="eyebrow text-primary">Recuperação</p>
          <h1 className="display-hero mt-8 text-5xl">
            Esqueci<br />a senha.
          </h1>
          <p className="mt-6 max-w-xs text-foreground/70">
            Diz teu email — mandamos um link pra refazer.
          </p>
        </header>

        <form
          onSubmit={onSubmit}
          className="col-span-12 mt-12 space-y-8 border-t border-foreground pt-10 md:col-span-7 md:mt-0 md:border-l md:border-t-0 md:pl-8 md:pt-0"
          noValidate
        >
          <CampoForm
            label="Email"
            type="email"
            autoComplete="email"
            erro={errors.email?.message}
            {...register('email')}
          />

          {erro ? (
            <p
              role="alert"
              className="border-l-2 border-destructive pl-3 text-sm text-destructive"
            >
              {erro}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? 'Enviando…' : 'Enviar link'}
          </Button>
        </form>
      </div>
    </section>
  );
}
