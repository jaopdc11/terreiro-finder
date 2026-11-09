import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { redefinirSenhaSchema, type RedefinirSenhaInput } from '../schemas';
import { useAuth } from '../hooks/useAuth';
import { PainelAuth } from '../components/PainelAuth';

const C =
  'w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-lg text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none';
const L = 'mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground';

/** Destino do link de "esqueci a senha". */
export function RedefinirSenha() {
  const auth = useAuth();
  const [params] = useSearchParams();
  const token = params.get('token');
  const [erro, setErro] = useState<string | null>(null);
  const [pronto, setPronto] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RedefinirSenhaInput>({ resolver: zodResolver(redefinirSenhaSchema) });

  const onSubmit = handleSubmit(async ({ senha }) => {
    setErro(null);
    if (!token) {
      setErro('Link incompleto. Abra o link do e-mail de novo.');
      return;
    }
    try {
      await auth.redefinirSenha(token, senha);
      setPronto(true);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível trocar a senha.');
    }
  });

  return (
    <PainelAuth frase={<>Senha nova,<br /><em>caminho</em> de volta.</>} rodape="Você volta pra sua casa.">
      <div>
        <p className="eyebrow eyebrow-ornado inline-flex items-center">Acesso</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {pronto ? 'Senha trocada.' : 'Criar senha nova'}
        </h1>
      </div>

      {pronto ? (
        <>
          <p className="text-sm text-muted-foreground">
            Por segurança, todas as sessões abertas foram encerradas. Entre de novo com a senha nova.
          </p>
          <Link to="/login" className="inline-block text-sm font-medium text-primary hover:underline">
            Entrar →
          </Link>
        </>
      ) : (
        <form onSubmit={onSubmit} className="space-y-8" noValidate>
          <div>
            <label htmlFor="rd-senha" className={L}>Senha nova</label>
            <input id="rd-senha" type="password" autoComplete="new-password" {...register('senha')} className={C} />
            {errors.senha ? (
              <p role="alert" className="mt-1.5 text-xs text-destructive">{errors.senha.message}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="rd-confirmacao" className={L}>Repita a senha</label>
            <input
              id="rd-confirmacao"
              type="password"
              autoComplete="new-password"
              {...register('confirmacao')}
              className={C}
            />
            {errors.confirmacao ? (
              <p role="alert" className="mt-1.5 text-xs text-destructive">{errors.confirmacao.message}</p>
            ) : null}
          </div>
          {erro ? (
            <p role="alert" className="text-sm text-destructive">{erro}</p>
          ) : null}
          <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Salvando…' : 'Salvar senha'}
          </Button>
        </form>
      )}
    </PainelAuth>
  );
}
