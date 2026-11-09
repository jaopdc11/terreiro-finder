import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
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
import { Riscos } from '@/shared/components/ornamentos/Ornamentos';
import { Button } from '@/shared/ui/button';

type Acumulado = Partial<NovaCasaDeProprioInput>;

const PASSOS = [
  { titulo: 'Identidade', desc: 'Nome, tradição e quem você é na casa.' },
  { titulo: 'Endereço', desc: 'Onde fica o terreiro.' },
  { titulo: 'Abertura & Contato', desc: 'Visitas, fotos e como te encontrar.' },
] as const;

const EDITORIAL: {
  eyebrow: string;
  headline: React.ReactNode;
  descricao: string;
}[] = [
  {
    eyebrow: 'Cadastro · 1 / 3',
    headline: (
      <>
        Quem <em className="display-serif italic text-primary">é</em> sua casa?
      </>
    ),
    descricao:
      'Nome, tradição, linha de trabalho — as palavras que definem quem você é antes de qualquer endereço.',
  },
  {
    eyebrow: 'Cadastro · 2 / 3',
    headline: (
      <>
        Onde <em className="display-serif italic text-primary">fica</em> o terreiro?
      </>
    ),
    descricao:
      'Localização é o que coloca a casa no mapa. Você controla o quanto do endereço fica visível ao público.',
  },
  {
    eyebrow: 'Cadastro · 3 / 3',
    headline: (
      <>
        Como <em className="display-serif italic text-primary">receber</em> quem vem?
      </>
    ),
    descricao:
      'A casa define sua abertura: visitas, fotos e canais de contato. Nada vai ao ar sem você autorizar.',
  },
];

function SuccessScreen() {
  return (
    <section className="hero-gradient min-h-[calc(100vh-4rem)]">
      <div className="container flex max-w-2xl flex-col items-center py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <p className="eyebrow eyebrow-ornado mt-8 inline-flex items-center">Confirmação</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
          Cadastro recebido.{' '}
          <span className="display-serif italic text-primary">Axé.</span>
        </h1>
        <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">
          Suas informações estão em validação. Após a aprovação, a casa aparecerá no
          mapa como <strong className="text-foreground">verificada</strong> e você será
          vinculado como dirigente principal no painel.
        </p>
        <Riscos className="mx-auto my-8 h-3 w-24" accent="hsl(var(--terra-pemba))" />
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/mapa">
            <Button variant="outline">Voltar ao mapa</Button>
          </Link>
          <Link to="/painel">
            <Button variant="primary">Ir para o painel</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

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
    return <SuccessScreen />;
  }

  const ed = EDITORIAL[passo] ?? EDITORIAL[0]!;

  return (
    <div className="min-h-[calc(100vh-4rem)] border-b border-border">
      <div className="container max-w-6xl py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-20">

          {/* ── Sidebar editorial (sticky) ── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="eyebrow eyebrow-ornado inline-flex items-center">
              {ed.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              {ed.headline}
            </h1>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              {ed.descricao}
            </p>

            <Riscos className="my-8 h-3 w-20" accent="hsl(var(--terra-pemba))" />

            <ul className="space-y-5">
              {PASSOS.map((p, i) => {
                const concluido = i < passo;
                const atual = i === passo;
                return (
                  <li key={p.titulo} className="flex gap-4">
                    <span
                      className={`pt-0.5 font-mono text-xs ${
                        concluido
                          ? 'text-primary'
                          : atual
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p
                        className={`text-sm ${
                          concluido
                            ? 'text-primary'
                            : atual
                              ? 'font-semibold text-foreground'
                              : 'text-muted-foreground'
                        }`}
                      >
                        {p.titulo}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {p.desc}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ── Coluna do formulário ── */}
          <div>
            {/* Indicador de passo (mobile) */}
            <ol
              className="mb-8 flex gap-1.5 lg:hidden"
              aria-label="Progresso do cadastro"
            >
              {PASSOS.map((p, i) => (
                <li
                  key={p.titulo}
                  className={`flex flex-1 items-center gap-2 rounded-md px-3 py-2.5 text-xs font-medium transition-colors ${
                    i === passo
                      ? 'bg-foreground text-background'
                      : i < passo
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}
                  aria-current={i === passo ? 'step' : undefined}
                >
                  <span className="font-mono text-[10px]">
                    {i < passo ? '✓' : String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="truncate">{p.titulo}</span>
                </li>
              ))}
            </ol>

            {/* Título do passo */}
            <div className="mb-8">
              <p className="font-mono text-xs text-muted-foreground">
                Passo {passo + 1} de {PASSOS.length}
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                {PASSOS[passo].titulo}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {PASSOS[passo].desc}
              </p>
            </div>

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
        </div>
      </div>
    </div>
  );
}
