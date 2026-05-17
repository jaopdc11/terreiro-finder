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
    <section className="container max-w-5xl py-20">
      <div className="grid grid-cols-12 gap-x-8">
        <header className="col-span-12 md:col-span-5">
          <p className="eyebrow text-primary">Acesso</p>
          <h1 className="display-hero mt-8 text-5xl">
            Salve.<br /><em>Axé.</em>
          </h1>
          <p className="mt-6 max-w-xs text-foreground/70">
            Entra pra favoritar casa, indicar terreiro ou gerir a sua.
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
          <CampoForm
            label="Senha"
            type="password"
            autoComplete="current-password"
            erro={errors.senha?.message}
            {...register('senha')}
          />

          {erroServidor ? (
            <p role="alert" className="border-l-2 border-destructive pl-3 text-sm text-destructive">
              {erroServidor}
            </p>
          ) : null}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/recuperar-senha"
              className="link-underline text-sm text-foreground"
            >
              Esqueci a senha
            </Link>
            <Button type="submit" disabled={isSubmitting} size="lg">
              {isSubmitting ? 'Entrando…' : 'Entrar'}
            </Button>
          </div>

          <p className="border-t border-foreground/10 pt-6 text-sm text-muted-foreground">
            Não tem cadastro?{' '}
            <Link to="/cadastro" className="link-underline text-foreground">
              Criar conta
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
