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
    <section className="container max-w-md py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Entrar</h1>
        <p className="mt-2 text-muted-foreground">
          Pra favoritar casa, indicar terreiro ou gerir a sua.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="card-soft mt-8 space-y-5 p-6"
        noValidate
      >
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
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 p-2.5 text-sm text-destructive"
          >
            {erroServidor}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <Link
            to="/recuperar-senha"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Esqueci a senha
          </Link>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            size="default"
          >
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Ainda não tem conta?{' '}
        <Link to="/cadastro" className="font-medium text-foreground hover:underline">
          Criar conta
        </Link>
      </p>
    </section>
  );
}
