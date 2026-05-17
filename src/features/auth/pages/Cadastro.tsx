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
      });
      navigate('/', { replace: true });
    } catch (e) {
      setErroServidor(e instanceof Error ? e.message : 'Não rolou criar conta agora.');
    }
  });

  return (
    <section className="container max-w-md py-12">
      <h1 className="font-display text-3xl">Criar conta</h1>
      <p className="mt-2 text-muted-foreground">
        Conta gratuita. Serve pra favoritar, indicar uma casa ou pra dirigência gerenciar a sua.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
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
