import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Riscos } from '@/shared/components/ornamentos/Ornamentos';
import { Button } from '@/shared/ui/button';
import { recuperarSenhaSchema, type RecuperarSenhaInput } from '../schemas';
import { useAuth } from '../hooks/useAuth';

const C =
  'w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-lg text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none';
const L =
  'mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground';

export function RecuperarSenha() {
  const auth = useAuth();
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecuperarSenhaInput>({
    resolver: zodResolver(recuperarSenhaSchema),
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    setErro(null);
    try {
      await auth.recuperarSenha(email);
      setEnviado(true);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível enviar o link.');
    }
  });

  if (enviado) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)]">
        <div className="relative hidden w-[46%] overflow-hidden lg:flex hero-gradient">
          <div className="relative z-10 flex flex-col justify-between p-14 text-primary-foreground">
            <p className="eyebrow text-primary-foreground/70">Acesso</p>
            <div className="space-y-6">
              <Riscos className="h-6 w-auto text-primary-foreground/30" />
              <p className="display-serif text-4xl italic leading-snug">
                Verifique<br />seu email.
              </p>
            </div>
            <p className="text-sm text-primary-foreground/50">O link chega em minutos.</p>
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 sm:px-12">
          <div className="w-full max-w-sm space-y-4 text-center">
            <p className="eyebrow eyebrow-ornado inline-flex items-center">Confirmação</p>
            <h1 className="text-2xl font-semibold tracking-tight">Email enviado.</h1>
            <p className="text-sm text-muted-foreground">
              Se a conta existir, enviamos um link para redefinir a senha.
            </p>
            <Link
              to="/login"
              className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
            >
              Voltar para entrar →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">

      {/* ── Painel editorial ── */}
      <div className="relative hidden w-[46%] overflow-hidden lg:flex hero-gradient">
        <div className="relative z-10 flex flex-col justify-between p-14 text-primary-foreground">
          <p className="eyebrow text-primary-foreground/70">Acesso</p>
          <div className="space-y-6">
            <Riscos className="h-6 w-auto text-primary-foreground/30" />
            <p className="display-serif text-4xl italic leading-snug">
              Todo início<br />pede um<br /><em>passo</em>.
            </p>
          </div>
          <p className="text-sm text-primary-foreground/50">
            Você volta pra sua casa.
          </p>
        </div>
      </div>

      {/* ── Formulário ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 sm:px-12">
        <div className="w-full max-w-sm space-y-10">
          <div>
            <p className="eyebrow eyebrow-ornado inline-flex items-center">Acesso</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Recuperar senha
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Informe seu email — enviamos um link de redefinição.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-8" noValidate>
            <div>
              <label htmlFor="rs-email" className={L}>Email</label>
              <input
                id="rs-email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register('email')}
                className={C}
              />
              {errors.email ? (
                <p role="alert" className="mt-1.5 text-xs text-destructive">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            {erro ? (
              <p role="alert" className="text-sm text-destructive">{erro}</p>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Enviando…' : 'Enviar link'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Lembrou a senha?{' '}
            <Link to="/login" className="font-medium text-foreground hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
