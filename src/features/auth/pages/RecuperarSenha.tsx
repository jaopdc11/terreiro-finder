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
      <section className="container max-w-md py-12">
        <h1 className="font-display text-3xl">Olha o email</h1>
        <p className="mt-2 text-muted-foreground">
          Se a conta existe, mandamos um link pra você refazer a senha.
        </p>
        <Link to="/login" className="mt-6 inline-block text-primary hover:underline">
          Voltar pra entrar
        </Link>
      </section>
    );
  }

  return (
    <section className="container max-w-md py-12">
      <h1 className="font-display text-3xl">Esqueci a senha</h1>
      <p className="mt-2 text-muted-foreground">
        Diz teu email que mandamos um link pra refazer.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
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
