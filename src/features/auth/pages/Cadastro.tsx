import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { CampoForm } from '../components/CampoForm';
import { cadastroSchema, type CadastroInput } from '../schemas';
import { useAuth } from '../hooks/useAuth';

export function Cadastro() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [erroServidor, setErroServidor] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CadastroInput>({ resolver: zodResolver(cadastroSchema) });

  const onSubmit = handleSubmit(async (v) => {
    setErroServidor(null);
    try {
      await auth.cadastrar({
        nomeCompleto: v.nomeCompleto,
        ...(v.nomeExibicao ? { nomeExibicao: v.nomeExibicao } : {}),
        email: v.email,
        senha: v.senha,
        eDirigencia: v.eDirigencia,
      });
      navigate('/', { replace: true });
    } catch (e) {
      setErroServidor(e instanceof Error ? e.message : 'Não rolou criar conta agora.');
    }
  });

  return (
    <section className="container max-w-md py-14">
      <header className="space-y-2 text-center">
        <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">
          <span aria-hidden="true" className="h-1 w-6 rounded-full bg-primary" />
          Nova conta
        </p>
        <h1 className="font-display text-4xl">Criar conta</h1>
        <p className="text-muted-foreground">
          Gratuita. Serve pra favoritar, indicar ou gerir a sua casa.
        </p>
      </header>

      <form onSubmit={onSubmit} className="card-surface mt-8 space-y-5 p-6 sm:p-7" noValidate>
        <CampoForm
          label="Nome completo"
          autoComplete="name"
          erro={errors.nomeCompleto?.message}
          {...register('nomeCompleto')}
        />
        <CampoForm
          label="Como prefere ser chamada(o) (opcional)"
          autoComplete="nickname"
          erro={errors.nomeExibicao?.message}
          {...register('nomeExibicao')}
        />
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
          autoComplete="new-password"
          erro={errors.senha?.message}
          {...register('senha')}
        />
        <CampoForm
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          erro={errors.confirmacao?.message}
          {...register('confirmacao')}
        />

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4"
            {...register('eDirigencia')}
          />
          <span className="text-sm">
            <strong className="block font-medium text-foreground">
              Sou da dirigência de uma casa
            </strong>
            <span className="mt-1 block text-muted-foreground">
              Marque se você é Pai/Mãe de Santo, Babalorixá, Iyalorixá, Tata,
              Tateto ou equivalente em outra tradição. Você poderá cadastrar
              sua casa logo depois.
            </span>
          </span>
        </label>

        {erroServidor ? (
          <p role="alert" className="text-sm text-destructive">
            {erroServidor}
          </p>
        ) : null}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Criando…' : 'Criar conta'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Já tem conta?{' '}
        <Link to="/login" className="text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </section>
  );
}
