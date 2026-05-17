import { useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  NovaCasaDeProprioInput,
  PassoAberturaContatoInput,
  PassoEnderecoInput,
  PassoIdentidadeInput,
} from '../schemas';
import { PassoIdentidade } from '../components/PassoIdentidade';
import { PassoEndereco } from '../components/PassoEndereco';
import { PassoAberturaContato } from '../components/PassoAberturaContato';
import { useCadastrarCasa } from '../hooks/useCadastrarCasa';

type Acumulado = Partial<NovaCasaDeProprioInput>;

export function Cadastrar() {
  const [passo, setPasso] = useState<0 | 1 | 2>(0);
  const [acumulado, setAcumulado] = useState<Acumulado>({});
  const mutation = useCadastrarCasa();

  const aoConcluirIdentidade = (v: PassoIdentidadeInput) => {
    setAcumulado((a) => ({ ...a, ...v }));
    setPasso(1);
  };
  const aoConcluirEndereco = (v: PassoEnderecoInput) => {
    setAcumulado((a) => ({ ...a, ...v }));
    setPasso(2);
  };
  const aoSubmeter = async (v: PassoAberturaContatoInput) => {
    const completo = { ...acumulado, ...v } as NovaCasaDeProprioInput;
    await mutation.mutateAsync(completo);
  };

  if (mutation.isSuccess) {
    return (
      <section className="container max-w-2xl py-12">
        <h1 className="font-display text-3xl">Cadastro recebido. Axé.</h1>
        <p className="mt-3 text-muted-foreground">
          Vamos validar suas informações. Quando a casa for aprovada, ela
          aparece no mapa <strong>verificada</strong> e você vira dirigente
          principal no seu painel.
        </p>
        <div className="mt-6 flex gap-3">
          <Link to="/" className="text-primary hover:underline">
            Voltar pra busca
          </Link>
          <Link to="/painel" className="text-primary hover:underline">
            Ir pro meu painel
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container max-w-2xl py-12">
      <h1 className="font-display text-3xl">Cadastrar minha casa</h1>
      <p className="mt-2 text-muted-foreground">
        Você está cadastrando como dirigência. Depois de aprovado, a casa nasce
        verificada e você vira dirigente principal.
      </p>

      <ol
        className="mt-6 flex items-center gap-2 text-sm"
        aria-label="Progresso do cadastro"
      >
        {(['Identidade', 'Endereço', 'Abertura & Contato'] as const).map((t, i) => (
          <li
            key={t}
            className={
              'flex-1 rounded-md border px-3 py-2 text-center ' +
              (i === passo
                ? 'border-primary bg-primary/5 font-medium text-primary'
                : i < passo
                  ? 'border-border bg-muted text-foreground'
                  : 'border-border text-muted-foreground')
            }
            aria-current={i === passo ? 'step' : undefined}
          >
            {i + 1}. {t}
          </li>
        ))}
      </ol>

      <div className="mt-6">
        {passo === 0 ? (
          <PassoIdentidade inicial={acumulado} onAvancar={aoConcluirIdentidade} />
        ) : null}
        {passo === 1 ? (
          <PassoEndereco
            inicial={acumulado}
            onVoltar={() => setPasso(0)}
            onAvancar={aoConcluirEndereco}
          />
        ) : null}
        {passo === 2 ? (
          <PassoAberturaContato
            inicial={acumulado}
            onVoltar={() => setPasso(1)}
            onSubmit={aoSubmeter}
            carregando={mutation.isPending}
            erroServidor={
              mutation.error instanceof Error ? mutation.error.message : null
            }
          />
        ) : null}
      </div>
    </section>
  );
}
