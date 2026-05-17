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
    <section className="container max-w-md py-12">
      <h1 className="font-display text-3xl">Entrar</h1>
      <p className="mt-2 text-muted-foreground">
        Salve. Entra pra favoritar casa, indicar terreiro ou gerir a sua.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
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
