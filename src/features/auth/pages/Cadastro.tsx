import { forwardRef, useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import {
  Arco,
  PontosGrade,
} from '@/shared/components/ornamentos/Ornamentos';
import { cadastroSchema, type CadastroInput } from '../schemas';
import { useAuth } from '../hooks/useAuth';

// forwardRef: o register() do react-hook-form precisa do ref do input
const Campo = forwardRef(function Campo(
  {
  label,
  erro,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  erro?: string | undefined;
},
  ref: React.Ref<HTMLInputElement>,
) {
  // label ligado ao input: leitor de tela e getByLabel dependem disso
  const idGerado = useId();
  const id = rest.id ?? idGerado;
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <input
        className="w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-lg text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none"
        {...rest}
        ref={ref}
        id={id}
      />
      {erro ? (
        <p role="alert" className="mt-1.5 text-xs text-destructive">
          {erro}
        </p>
      ) : null}
    </div>
  );
});

export function Cadastro() {
  const auth = useAuth();
  const [erroServidor, setErroServidor] = useState<string | null>(null);
  // Cadastro feito: a conta só entra depois de confirmar o e-mail.
  const [enviadoPara, setEnviadoPara] = useState<string | null>(null);
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
      setEnviadoPara(v.email);
    } catch (e) {
      setErroServidor(
        e instanceof Error ? e.message : 'Não foi possível criar a conta.',
      );
    }
  });

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">

      {/* ── Painel editorial ── */}
      <div className="relative hidden w-[46%] overflow-hidden lg:flex hero-gradient">
        <div className="relative z-10 flex flex-1 flex-col justify-between p-10 xl:p-14">
          <p className="eyebrow eyebrow-ornado inline-flex items-center">Encruza</p>

          <div>
            <Arco className="mb-8 h-12 w-32 opacity-40" />
            <blockquote className="text-4xl font-semibold leading-tight tracking-tight text-foreground xl:text-5xl">
              Coloque sua casa{' '}
              <em className="display-serif italic text-primary">no mapa</em>.
            </blockquote>
            <ul className="mt-10 space-y-5">
              {[
                { n: '01', t: 'Gratuito. Sempre.', d: 'Sem custo, sem anúncio, para nada.' },
                { n: '02', t: 'A casa controla', d: 'Edite, oculte ou arquive quando quiser.' },
                { n: '03', t: 'Moderação humana', d: 'Nada publica sem consentimento.' },
              ].map((p) => (
                <li key={p.n} className="flex gap-4">
                  <span className="pt-0.5 font-mono text-xs text-primary">{p.n}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p.t}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{p.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Itajaí · SC
          </p>
        </div>

        <PontosGrade
          className="pointer-events-none absolute bottom-0 right-0 h-64 w-1/2 opacity-25"
          color="hsl(var(--terra-pemba))"
        />
      </div>

      {/* ── Painel do form ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 sm:px-12">
        <div className="w-full max-w-sm">

          <p className="eyebrow eyebrow-ornado inline-flex items-center">Nova conta</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Criar conta
          </h1>

          {enviadoPara ? (
            <div className="mt-10 space-y-4" data-testid="cadastro-confira-email">
              <p className="text-lg font-semibold">Confira seu e-mail.</p>
              <p className="text-sm text-muted-foreground">
                Mandamos um link de confirmação pra <strong>{enviadoPara}</strong>. A conta é
                ativada quando você abrir o link (ele vale por 48 horas). Não chegou? Olhe o spam
                ou peça outro na tela de entrar.
              </p>
              <Link to="/login" className="inline-block text-sm font-medium text-primary hover:underline">
                Ir para entrar →
              </Link>
            </div>
          ) : (
          <form onSubmit={onSubmit} className="mt-10 space-y-7" noValidate>
            <Campo
              label="Nome completo"
              autoComplete="name"
              placeholder="Como aparece no documento"
              erro={errors.nomeCompleto?.message}
              {...register('nomeCompleto')}
            />
            <Campo
              label="Como prefere ser chamado(a)"
              autoComplete="nickname"
              placeholder="opcional"
              erro={errors.nomeExibicao?.message}
              {...register('nomeExibicao')}
            />
            <Campo
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              erro={errors.email?.message}
              {...register('email')}
            />
            <Campo
              label="Senha"
              type="password"
              autoComplete="new-password"
              placeholder="mínimo 8 caracteres"
              erro={errors.senha?.message}
              {...register('senha')}
            />
            <Campo
              label="Confirmar senha"
              type="password"
              autoComplete="new-password"
              placeholder="repita a senha"
              erro={errors.confirmacao?.message}
              {...register('confirmacao')}
            />

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-xs transition-all hover:border-foreground/20 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                {...register('eDirigencia')}
              />
              <span className="text-sm">
                <strong className="block font-medium text-foreground">
                  Sou da dirigência de uma casa
                </strong>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  Pai/Mãe de Santo, Babalorixá, Iyalorixá, Tata ou equivalente.
                </span>
              </span>
            </label>

            {erroServidor ? (
              <p
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/5 p-2.5 text-sm text-destructive"
              >
                {erroServidor}
              </p>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Criando…' : 'Criar conta'}
            </Button>
          </form>
          )}

          <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link to="/login" className="link-underline font-medium text-foreground">
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
