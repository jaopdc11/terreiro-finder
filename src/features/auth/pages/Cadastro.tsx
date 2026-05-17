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
      setErroServidor(
        e instanceof Error ? e.message : 'Não rolou criar conta agora.',
      );
    }
  });

  return (
    <section className="container max-w-5xl py-20">
      <div className="grid grid-cols-12 gap-x-8">
        <header className="col-span-12 md:col-span-5">
          <p className="eyebrow text-primary">Nova conta</p>
          <h1 className="display-hero mt-8 text-5xl">
            Criar<br />conta.
          </h1>
          <p className="mt-6 max-w-xs text-foreground/70">
            Gratuita. Serve pra favoritar, indicar ou gerir a sua casa.
          </p>
        </header>

        <form
          onSubmit={onSubmit}
          className="col-span-12 mt-12 space-y-6 border-t border-foreground pt-10 md:col-span-7 md:mt-0 md:border-l md:border-t-0 md:pl-8 md:pt-0"
          noValidate
        >
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

          <label className="flex cursor-pointer items-start gap-3 border border-foreground/20 bg-background p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-primary"
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
            <p
              role="alert"
              className="border-l-2 border-destructive pl-3 text-sm text-destructive"
            >
              {erroServidor}
            </p>
          ) : null}

          <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
            {isSubmitting ? 'Criando…' : 'Criar conta'}
          </Button>

          <p className="border-t border-foreground/10 pt-6 text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link to="/login" className="link-underline text-foreground">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
