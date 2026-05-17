import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useServices } from '@/shared/hooks/useServices';
import { useCasaDoPainel, useMinhasCasas } from '../hooks/usePainel';
import { AbaPerfil } from '../components/AbaPerfil';
import { AbaAbertura } from '../components/AbaAbertura';
import { AbaEndereco } from '../components/AbaEndereco';
import { AbaTradicaoUmbanda } from '../components/AbaTradicaoUmbanda';
import { AbaTradicaoCandomble } from '../components/AbaTradicaoCandomble';
import { AbaTradicaoQuimbanda } from '../components/AbaTradicaoQuimbanda';
import { AbaFotos } from '../components/AbaFotos';

type Aba = 'perfil' | 'endereco' | 'tradicao' | 'fotos' | 'abertura';

const ABAS: { v: Aba; label: string; num: string }[] = [
  { v: 'perfil', label: 'Perfil', num: '01' },
  { v: 'endereco', label: 'Endereço', num: '02' },
  { v: 'tradicao', label: 'Tradição', num: '03' },
  { v: 'fotos', label: 'Fotos', num: '04' },
  { v: 'abertura', label: 'Abertura', num: '05' },
];

export function Painel() {
  const { sessao } = useServices();
  const nome = sessao.use((s) => s.sessao?.nomeExibicao);
  const { data: casas, isLoading } = useMinhasCasas();
  const [casaSelecionada, setCasaSelecionada] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div
        className="container py-20 text-xs uppercase tracking-widest text-muted-foreground"
        role="status"
      >
        Carregando suas casas…
      </div>
    );
  }

  if (!casas || casas.length === 0) {
    return (
      <section className="container max-w-3xl py-20">
        <p className="eyebrow text-primary">Painel</p>
        <h1 className="display-hero mt-8 text-5xl">
          Sem casa<br />vinculada<em>.</em>
        </h1>
        <p className="mt-8 max-w-prose text-foreground/80">
          Salve, <strong className="text-foreground">{nome}</strong>. Você
          ainda não está vinculada(o) a nenhuma casa neste painel.
        </p>
        <p className="mt-4 max-w-prose text-foreground/80">
          Se você é dirigente de uma casa que já está aqui mas marcada como{' '}
          <em className="italic">não verificada</em>, abre a ficha dela e clica
          em <em className="italic">Reivindique aqui</em>. Depois que
          confirmarmos, ela aparece neste painel.
        </p>
        <Link
          to="/"
          className="link-underline mt-8 inline-block text-sm font-semibold uppercase tracking-wider text-foreground"
        >
          Ver casas
        </Link>
      </section>
    );
  }

  if (!casaSelecionada) {
    return (
      <section className="container max-w-4xl py-20">
        <header className="border-b border-foreground pb-10">
          <p className="eyebrow text-primary">Painel da dirigência</p>
          <h1 className="display-hero mt-8 text-5xl">
            Salve, <em>{nome}</em>.
          </h1>
          <p className="mt-6 max-w-md text-foreground/70">
            Escolha uma casa pra editar.
          </p>
        </header>

        <ul className="border-b border-foreground/10">
          {casas.map((c, idx) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setCasaSelecionada(c.id)}
                className="grid w-full grid-cols-12 items-baseline gap-4 border-t border-foreground/10 py-6 text-left transition-colors hover:bg-muted"
              >
                <span className="col-span-12 font-mono text-xs text-primary sm:col-span-1">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="col-span-12 sm:col-span-9">
                  <h2 className="font-display text-2xl leading-tight">
                    {c.nome}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="uppercase tracking-wider">
                      {c.tradicaoPrincipal}
                    </span>{' '}
                    · {c.cidade}/{c.estado}
                  </p>
                </div>
                <span
                  className={
                    'col-span-12 text-[11px] font-semibold uppercase tracking-widest sm:col-span-2 sm:text-right ' +
                    (c.estaVerificada()
                      ? 'text-primary'
                      : 'text-muted-foreground')
                  }
                >
                  {c.estaVerificada() ? '✓ Verificada' : 'Não verificada'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <PainelDeCasa
      casaId={casaSelecionada}
      onVoltar={() => setCasaSelecionada(null)}
    />
  );
}

function PainelDeCasa({
  casaId,
  onVoltar,
}: {
  casaId: string;
  onVoltar(): void;
}) {
  const { data: casa, isLoading } = useCasaDoPainel(casaId);
  const [aba, setAba] = useState<Aba>('perfil');

  if (isLoading) {
    return (
      <div className="container py-20 text-xs uppercase tracking-widest text-muted-foreground">
        Carregando…
      </div>
    );
  }
  if (!casa) {
    return (
      <div className="container py-20">
        <p className="font-display text-2xl">Casa não encontrada.</p>
        <button
          onClick={onVoltar}
          className="link-underline mt-6 text-sm font-semibold uppercase tracking-wider text-foreground"
        >
          ← Voltar
        </button>
      </div>
    );
  }

  const abaAtual = ABAS.find((a) => a.v === aba) ?? ABAS[0]!;

  return (
    <section className="container max-w-5xl py-16">
      <button
        onClick={onVoltar}
        className="link-underline text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground"
      >
        ← Outras casas
      </button>

      <header className="mt-6 border-b border-foreground pb-10">
        <p className="eyebrow text-primary">
          {casa.tradicaoPrincipal} · {casa.cidade}/{casa.estado}
        </p>
        <h1 className="display-hero mt-6 text-5xl text-foreground">
          {casa.nome}
        </h1>
        <p
          className={
            'mt-4 inline-block border px-3 py-1 text-[11px] font-semibold uppercase tracking-widest ' +
            (casa.estaVerificada()
              ? 'border-primary text-primary'
              : 'border-foreground/30 text-muted-foreground')
          }
        >
          {casa.estaVerificada() ? 'Verificada' : 'Não verificada'}
        </p>
      </header>

      <div
        role="tablist"
        className="flex flex-wrap items-stretch divide-x divide-foreground/10 border-b border-foreground"
      >
        {ABAS.map((a) => (
          <button
            key={a.v}
            role="tab"
            aria-selected={aba === a.v}
            onClick={() => setAba(a.v)}
            className={
              'flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ' +
              (aba === a.v
                ? 'bg-foreground text-background'
                : 'text-foreground/70 hover:bg-foreground hover:text-background')
            }
          >
            <span className="font-mono text-[10px] opacity-60">{a.num}</span>
            {a.label}
          </button>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-12 gap-x-6" data-testid="painel-aba">
        <div className="col-span-12 mb-6 md:col-span-3 md:mb-0">
          <p className="eyebrow text-muted-foreground">
            <span className="font-mono mr-2">{abaAtual.num}</span>
            {abaAtual.label}
          </p>
        </div>
        <div className="col-span-12 md:col-span-9 md:border-l md:border-foreground/10 md:pl-6">
          {aba === 'perfil' ? <AbaPerfil casa={casa} /> : null}
          {aba === 'endereco' ? <AbaEndereco casa={casa} /> : null}
          {aba === 'abertura' ? <AbaAbertura casa={casa} /> : null}
          {aba === 'tradicao' ? (
            casa.tradicaoPrincipal === 'umbanda' ? (
              <AbaTradicaoUmbanda casaId={casa.id} />
            ) : casa.tradicaoPrincipal === 'candomble' ? (
              <AbaTradicaoCandomble casaId={casa.id} />
            ) : casa.tradicaoPrincipal === 'quimbanda' ? (
              <AbaTradicaoQuimbanda casaId={casa.id} />
            ) : (
              <p className="text-muted-foreground">
                Editor para tradição{' '}
                <strong className="text-foreground">
                  {casa.tradicaoPrincipal}
                </strong>{' '}
                chega numa próxima fase. O bloco específico aparece em
                Umbanda, Candomblé e Quimbanda.
              </p>
            )
          ) : null}
          {aba === 'fotos' ? <AbaFotos casaId={casa.id} /> : null}
        </div>
      </div>
    </section>
  );
}
