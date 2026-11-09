import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PainelAuth } from '../components/PainelAuth';

type Estado =
  | { tipo: 'confirmando' }
  | { tipo: 'confirmado'; nome: string; dirigencia: boolean }
  | { tipo: 'erro'; mensagem: string };

/** Destino do link do e-mail de cadastro. Confirma, já entra e dá as boas-vindas. */
export function ConfirmarEmail() {
  const auth = useAuth();
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
      .then((s) => setEstado({ tipo: 'confirmado', nome: s.nomeExibicao, dirigencia: s.role === 'dirigente' }))
      .catch((e: unknown) =>
        setEstado({ tipo: 'erro', mensagem: e instanceof Error ? e.message : 'Não deu pra confirmar.' }),
      );
  }, [auth, token]);

  const titulo = {
    confirmando: 'Confirmando seu e-mail…',
    confirmado: 'E-mail confirmado',
    erro: 'Não deu certo',
  }[estado.tipo];

  return (
    <PainelAuth frase={<>Bem-vinda(o)<br />à casa.</>} rodape={estado.tipo === 'confirmado' ? 'Axé.' : 'Falta só um passo.'}>
      <div>
        <p className="eyebrow eyebrow-ornado inline-flex items-center">Confirmação</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{titulo}</h1>
      </div>

      {estado.tipo === 'confirmando' && <p className="text-sm text-muted-foreground">Só um instante.</p>}

      {estado.tipo === 'confirmado' && (
        <>
          <p className="text-base">
            Tudo certo, <strong>{estado.nome}</strong>. Sua conta está ativa e você já entrou.
          </p>
          <div className="flex flex-col gap-3">
            {estado.dirigencia ? (
              <>
                <Link
                  to="/cadastrar"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Cadastrar minha casa
                </Link>
                <Link to="/mapa" className="text-center text-sm font-medium text-foreground hover:underline">
                  Ver as casas no mapa
                </Link>
              </>
            ) : (
              <Link
                to="/mapa"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 font-medium text-primary-foreground hover:bg-primary/90"
              >
                Encontrar uma casa
              </Link>
            )}
          </div>
        </>
      )}

      {estado.tipo === 'erro' && (
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
      )}
    </PainelAuth>
  );
}
