import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { CampoForm } from '../components/CampoForm';
import { loginSchema, type LoginInput } from '../schemas';
import { useAuth } from '../hooks/useAuth';

interface LocationState {
  from?: string;
}

export function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = (location.state as LocationState | null)?.from ?? '/';

  const [erroServidor, setErroServidor] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (valores) => {
    setErroServidor(null);
    try {
      await auth.login(valores.email, valores.senha);
      navigate(destino, { replace: true });
    } catch (e) {
      setErroServidor(e instanceof Error ? e.message : 'Falha no login.');
    }
  });

  return (
    <section className="container max-w-md py-14">
      <header className="space-y-2 text-center">
        <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">
          <span aria-hidden="true" className="h-1 w-6 rounded-full bg-primary" />
          Acesso
        </p>
        <h1 className="font-display text-4xl">Salve, axé.</h1>
        <p className="text-muted-foreground">
          Entra pra favoritar casa, indicar terreiro ou gerir a sua.
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
        <CampoForm
          label="Senha"
          type="password"
          autoComplete="current-password"
          erro={errors.senha?.message}
          {...register('senha')}
        />

        {erroServidor ? (
          <p role="alert" className="text-sm text-destructive">
            {erroServidor}
          </p>
        ) : null}

        <div className="flex items-center justify-between">
          <Link to="/recuperar-senha" className="text-sm text-primary hover:underline">
            Esqueci a senha
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </div>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Não tem cadastro?{' '}
        <Link to="/cadastro" className="text-primary hover:underline">
          Criar conta
        </Link>
      </p>
    </section>
  );
}
