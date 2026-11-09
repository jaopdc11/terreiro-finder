import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PainelAuth } from '../components/PainelAuth';

type Estado = { tipo: 'confirmando' } | { tipo: 'erro'; mensagem: string };

/** Destino do link do e-mail de cadastro. Confirma e já entra. */
export function ConfirmarEmail() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');
  const [estado, setEstado] = useState<Estado>({ tipo: 'confirmando' });
  // StrictMode roda o efeito 2x em dev; o token é de uso único.
  const disparado = useRef(false);

  useEffect(() => {
    if (disparado.current) return;
    disparado.current = true;
    if (!token) {
      setEstado({ tipo: 'erro', mensagem: 'Link incompleto. Abra o link do e-mail de novo.' });
      return;
    }
    auth
      .confirmarEmail(token)
      .then(() => navigate('/', { replace: true }))
      .catch((e: unknown) =>
        setEstado({ tipo: 'erro', mensagem: e instanceof Error ? e.message : 'Não deu pra confirmar.' }),
      );
  }, [auth, navigate, token]);

  return (
    <PainelAuth frase={<>Bem-vinda(o)<br />à casa.</>} rodape="Falta só um passo.">
      <div>
        <p className="eyebrow eyebrow-ornado inline-flex items-center">Confirmação</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {estado.tipo === 'confirmando' ? 'Confirmando seu e-mail…' : 'Não deu certo'}
        </h1>
      </div>
      {estado.tipo === 'erro' ? (
        <>
          <p role="alert" className="text-sm text-destructive">
            {estado.mensagem}
          </p>
          <p className="text-sm text-muted-foreground">
            Pode pedir um link novo na tela de{' '}
            <Link to="/login" className="font-medium text-foreground hover:underline">
              entrar
            </Link>
            .
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Só um instante.</p>
      )}
    </PainelAuth>
  );
}
