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

const PASSOS = ['Identidade', 'Endereço', 'Abertura & Contato'] as const;

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
      <section className="container max-w-xl py-16">
        <div className="card-soft p-8 text-center">
          <p className="eyebrow eyebrow-ornado inline-flex items-center">Confirmação</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Cadastro recebido. Axé.
          </h1>
          <p className="mt-3 text-muted-foreground">
            Suas informações estão em validação. Após a aprovação, a casa
            aparecerá no mapa como <strong>verificada</strong> e você será
            vinculado como dirigente principal no painel.
          </p>
          <div className="mt-6 flex justify-center gap-6 text-sm">
            <Link
              to="/mapa"
              className="font-medium text-foreground hover:underline"
            >
              Voltar ao mapa
            </Link>
            <Link
              to="/painel"
              className="font-medium text-foreground hover:underline"
            >
              Ir para o painel
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container max-w-3xl py-12">
      <header className="border-b border-border pb-8">
        <p className="eyebrow eyebrow-ornado inline-flex items-center">Cadastro de casa</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Cadastrar minha casa
        </h1>
        <p className="mt-3 text-muted-foreground">
          Você está realizando o cadastro como dirigência. Após a aprovação,
          a casa nasce verificada e o seu usuário é vinculado como dirigente
          principal.
        </p>
      </header>

      <aside
        role="note"
        className="my-8 rounded-md border border-primary/30 bg-primary/5 p-4 text-sm"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Atenção
        </p>
        <p className="mt-1.5 text-foreground/85">
          Ao prosseguir, você confirma ser dirigente desta casa. Caso conheça
          o terreiro mas não faça parte da dirigência, utilize{' '}
          <Link to="/indicar" className="link-underline text-primary">
            Indicar uma casa
          </Link>{' '}
          — esse é o fluxo apropriado para compartilhar uma casa sem ser da
          dirigência.
        </p>
      </aside>

      <ol
        className="flex overflow-hidden rounded-md border border-border"
        aria-label="Progresso do cadastro"
      >
        {PASSOS.map((t, i) => (
          <li
            key={t}
            className={
              'flex flex-1 items-center gap-2 border-r border-border px-4 py-2.5 text-xs font-medium last:border-r-0 ' +
              (i === passo
                ? 'bg-foreground text-background'
                : i < passo
                  ? 'bg-primary/5 text-foreground'
                  : 'bg-background text-muted-foreground')
            }
            aria-current={i === passo ? 'step' : undefined}
          >
            <span className="font-mono text-[10px] opacity-70">
              {i < passo ? '✓' : String(i + 1).padStart(2, '0')}
            </span>
            <span className="truncate">{t}</span>
          </li>
        ))}
      </ol>

      <div className="card-soft mt-8 p-6">
        {passo === 0 ? (
          <PassoIdentidade
            inicial={acumulado}
            onAvancar={aoConcluirIdentidade}
          />
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
