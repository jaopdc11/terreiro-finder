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
      <section className="container max-w-2xl py-14">
        <div className="card-surface p-8 text-center">
          <span className="text-3xl" aria-hidden="true">🪔</span>
          <h1 className="mt-3 font-display text-3xl">Cadastro recebido. Axé.</h1>
          <p className="mt-3 text-muted-foreground">
            Vamos validar suas informações. Quando a casa for aprovada, ela
            aparece no mapa <strong>verificada</strong> e você vira dirigente
            principal no seu painel.
          </p>
          <div className="mt-6 flex justify-center gap-6 text-sm">
            <Link
              to="/"
              className="text-primary underline-offset-4 hover:underline"
            >
              Voltar pra busca
            </Link>
            <Link
              to="/painel"
              className="text-primary underline-offset-4 hover:underline"
            >
              Ir pro meu painel
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container max-w-2xl py-12">
      <header className="space-y-3 pb-2">
        <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">
          <span aria-hidden="true" className="h-1 w-6 rounded-full bg-primary" />
          Cadastro de casa
        </p>
        <h1 className="font-display text-4xl">Cadastrar minha casa</h1>
        <p className="text-muted-foreground">
          Você está cadastrando como dirigência. Depois de aprovado, a casa
          nasce verificada e você vira dirigente principal.
        </p>
      </header>

      <aside
        role="note"
        className="mt-6 rounded-xl border border-dashed border-primary/60 bg-primary/5 p-4 text-sm"
      >
        <p className="font-medium text-primary">
          Você está afirmando ser dirigente desta casa.
        </p>
        <p className="mt-1 text-foreground/80">
          Se você só conhece a casa mas não é da dirigência, volta e usa{' '}
          <Link to="/indicar" className="underline">
            Indicar uma casa
          </Link>{' '}
          — esse fluxo é o certo pra quem quer compartilhar uma casa sem ser
          da dirigência. Aqui, vamos contatar a casa antes de aprovar.
        </p>
      </aside>

      <ol
        className="mt-6 flex items-center gap-2 text-sm"
        aria-label="Progresso do cadastro"
      >
        {(['Identidade', 'Endereço', 'Abertura & Contato'] as const).map((t, i) => (
          <li
            key={t}
            className={
              'flex-1 rounded-lg border px-3 py-2.5 text-center text-xs font-medium transition-colors sm:text-sm ' +
              (i === passo
                ? 'border-primary bg-primary/10 text-primary shadow-warm-sm'
                : i < passo
                  ? 'border-primary/40 bg-primary/5 text-foreground/80'
                  : 'border-border/60 bg-card/40 text-muted-foreground')
            }
            aria-current={i === passo ? 'step' : undefined}
          >
            <span className="mr-1 inline-block" aria-hidden="true">
              {i < passo ? '✓' : i + 1 + '.'}
            </span>
            {t}
          </li>
        ))}
      </ol>

      <div className="mt-8 card-surface p-6 sm:p-7">
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
