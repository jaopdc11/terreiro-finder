import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { CampoForm } from '../components/CampoForm';
import { recuperarSenhaSchema, type RecuperarSenhaInput } from '../schemas';
import { useAuth } from '../hooks/useAuth';

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
      await auth.recuperarSenha(email, `${window.location.origin}/login`);
      setEnviado(true);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível enviar o link.');
    }
  });

  if (enviado) {
    return (
      <section className="container max-w-md py-16 text-center">
        <div className="card-soft p-8">
          <p className="eyebrow">Confirmação</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            Verifique seu email.
          </h1>
          <p className="mt-3 text-muted-foreground">
            Se a conta existir, enviamos um link para você redefinir a senha.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block text-sm font-medium text-foreground hover:underline"
          >
            Voltar para entrar
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container max-w-md py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Esqueci a senha
        </h1>
        <p className="mt-2 text-muted-foreground">
          Informe seu email e enviaremos um link para redefinir.
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

        {erro ? (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 p-2.5 text-sm text-destructive"
          >
            {erro}
          </p>
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
    </section>
  );
}
