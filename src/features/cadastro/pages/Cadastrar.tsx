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
      <section className="container max-w-2xl py-24">
        <div className="border-2 border-foreground p-10 text-center">
          <p className="eyebrow text-primary">Confirmação</p>
          <h1 className="display-hero mt-6 text-4xl">
            Cadastro<br />recebido.
          </h1>
          <p className="mt-6 text-foreground/75">
            Vamos validar suas informações. Quando a casa for aprovada, ela
            aparece no mapa <strong>verificada</strong> e você vira dirigente
            principal no seu painel.
          </p>
          <div className="mt-8 flex justify-center gap-8 text-xs font-semibold uppercase tracking-widest">
            <Link to="/" className="link-underline text-foreground">
              Voltar pra busca
            </Link>
            <Link to="/painel" className="link-underline text-foreground">
              Ir pro painel
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container max-w-4xl py-16">
      <header className="border-b border-foreground pb-10">
        <p className="eyebrow text-primary">Cadastro de casa</p>
        <h1 className="display-hero mt-8 text-5xl">
          Cadastrar<br />minha casa.
        </h1>
        <p className="mt-6 max-w-prose text-foreground/75">
          Você está cadastrando como dirigência. Depois de aprovado, a casa
          nasce verificada e você vira dirigente principal.
        </p>
      </header>

      <aside
        role="note"
        className="my-10 border-l-2 border-primary bg-primary/5 px-5 py-4 text-sm"
      >
        <p className="eyebrow text-primary">Atenção</p>
        <p className="mt-2 text-foreground/85">
          Você está afirmando ser dirigente desta casa. Se você só conhece a
          casa mas não é da dirigência, volta e usa{' '}
          <Link to="/indicar" className="link-underline text-primary">
            Indicar uma casa
          </Link>{' '}
          — esse fluxo é o certo pra quem quer compartilhar uma casa sem ser
          da dirigência.
        </p>
      </aside>

      <ol
        className="grid grid-cols-3 gap-0 border-y border-foreground"
        aria-label="Progresso do cadastro"
      >
        {PASSOS.map((t, i) => (
          <li
            key={t}
            className={
              'flex items-center gap-3 border-r border-foreground/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-widest last:border-r-0 ' +
              (i === passo
                ? 'bg-foreground text-background'
                : i < passo
                  ? 'text-primary'
                  : 'text-muted-foreground')
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

      <div className="mt-10">
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
