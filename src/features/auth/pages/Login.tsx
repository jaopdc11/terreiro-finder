import { forwardRef, useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import {
  FioComNo,
  PontosGrade,
  Riscos,
} from '@/shared/components/ornamentos/Ornamentos';
import { loginSchema, type LoginInput } from '../schemas';
import { useAuth } from '../hooks/useAuth';
import { ServiceError } from '@/shared/lib/errors';

interface LocationState {
  from?: string;
}

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

export function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = (location.state as LocationState | null)?.from ?? '/';

  const [erroServidor, setErroServidor] = useState<string | null>(null);
  // E-mail de quem tentou entrar sem ter confirmado (pra oferecer reenvio).
  const [naoConfirmado, setNaoConfirmado] = useState<string | null>(null);
  const [reenviado, setReenviado] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (valores) => {
    setErroServidor(null);
    setNaoConfirmado(null);
    setReenviado(false);
    try {
      await auth.login(valores.email, valores.senha);
      navigate(destino, { replace: true });
    } catch (e) {
      if (e instanceof ServiceError && e.code === 'EMAIL_NAO_CONFIRMADO') setNaoConfirmado(valores.email);
      setErroServidor(e instanceof Error ? e.message : 'Falha no login.');
    }
  });

  const reenviar = async () => {
    if (!naoConfirmado) return;
    try {
      await auth.reenviarConfirmacao(naoConfirmado);
      setReenviado(true);
    } catch (e) {
      setErroServidor(e instanceof Error ? e.message : 'Não foi possível reenviar.');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">

      {/* ── Painel editorial ── */}
      <div className="relative hidden w-[46%] overflow-hidden lg:flex hero-gradient">
        <div className="relative z-10 flex flex-1 flex-col justify-between p-10 xl:p-14">
          <p className="eyebrow eyebrow-ornado inline-flex items-center">Encruza</p>

          <div>
            <FioComNo className="mb-8 h-28 w-5 text-primary" />
            <blockquote className="text-4xl font-semibold leading-tight tracking-tight text-foreground xl:text-5xl">
              Cada casa<br />
              fala por{' '}
              <em className="display-serif italic text-primary">si</em>.
            </blockquote>
            <Riscos className="mt-8 h-3 w-24" accent="hsl(var(--terra-pemba))" />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Busca de casas de Umbanda, Candomblé, Quimbanda e outras tradições
              afro. Gratuito. Sempre.
            </p>
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

          <p className="eyebrow eyebrow-ornado inline-flex items-center">Acesso</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Entrar
          </h1>

          <form onSubmit={onSubmit} className="mt-10 space-y-8" noValidate>
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
              autoComplete="current-password"
              placeholder="••••••••"
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

            {naoConfirmado ? (
              reenviado ? (
                <p className="text-sm text-muted-foreground" data-testid="confirmacao-reenviada">
                  Mandamos um link novo pra {naoConfirmado}. Confira a caixa de entrada e o spam.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => void reenviar()}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Reenviar link de confirmação
                </button>
              )
            ) : null}

            <div className="space-y-4 pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Entrando…' : 'Entrar'}
              </Button>
              <div className="text-center">
                <Link
                  to="/recuperar-senha"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Esqueci a senha
                </Link>
              </div>
            </div>
          </form>

          <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            Ainda não tem conta?{' '}
            <Link to="/cadastro" className="link-underline font-medium text-foreground">
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
