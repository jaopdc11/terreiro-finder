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
import { AbaAgenda } from '../components/AbaAgenda';

type Aba = 'perfil' | 'endereco' | 'tradicao' | 'fotos' | 'abertura' | 'agenda';

const ABAS: { v: Aba; label: string; num: string }[] = [
  { v: 'perfil', label: 'Perfil', num: '01' },
  { v: 'endereco', label: 'Endereço', num: '02' },
  { v: 'tradicao', label: 'Tradição', num: '03' },
  { v: 'agenda', label: 'Agenda', num: '04' },
  { v: 'fotos', label: 'Fotos', num: '05' },
  { v: 'abertura', label: 'Abertura', num: '06' },
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
      <section className="container max-w-2xl py-16">
        <p className="eyebrow eyebrow-ornado inline-flex items-center">Painel</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Nenhuma casa vinculada.
        </h1>
        <p className="mt-6 text-muted-foreground">
          Olá, <strong className="text-foreground">{nome}</strong>. Sua conta
          ainda não está vinculada a nenhuma casa neste painel.
        </p>
        <p className="mt-3 text-muted-foreground">
          Se você é dirigente de uma casa já cadastrada mas marcada como{' '}
          <em>não verificada</em>, abra a ficha e clique em{' '}
          <em>Reivindique aqui</em>. Após a confirmação, ela aparece neste
          painel.
        </p>
        <Link
          to="/mapa"
          className="mt-6 inline-block text-sm font-medium text-foreground hover:underline"
        >
          Ver casas →
        </Link>
      </section>
    );
  }

  if (!casaSelecionada) {
    return (
      <section className="container max-w-4xl py-16">
        <header className="border-b border-border pb-8">
          <p className="eyebrow eyebrow-ornado inline-flex items-center">Painel da dirigência</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Olá, {nome}.
          </h1>
          <p className="mt-3 text-muted-foreground">
            {casas.length === 1 ? 'Selecione a casa para editar.' : 'Selecione uma casa para editar.'}
          </p>
        </header>

        <ul className="mt-6 space-y-2">
          {casas.map((c, idx) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setCasaSelecionada(c.id)}
                className="grid w-full grid-cols-12 items-baseline gap-4 rounded-md border border-transparent px-4 py-5 text-left transition-colors hover:border-border hover:bg-card"
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

        <div className="mt-8 border-t border-border pt-6">
          <Link
            to="/cadastrar"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
          >
            + Cadastrar outra casa
          </Link>
        </div>
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

      <header className="mt-6 border-b border-border pb-8">
        <p className="eyebrow eyebrow-ornado inline-flex items-center">
          {casa.tradicaoPrincipal} · {casa.cidade}/{casa.estado}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          {casa.nome}
        </h1>
        <p
          className={
            'mt-4 inline-block rounded-md border px-2.5 py-1 text-xs font-medium ' +
            (casa.estaVerificada()
              ? 'border-primary/40 bg-primary/5 text-primary'
              : 'border-border bg-background text-muted-foreground')
          }
        >
          {casa.estaVerificada() ? '✓ Verificada' : 'Não verificada'}
        </p>
      </header>

      <div
        role="tablist"
        className="sticky top-14 z-10 -mx-4 mt-8 flex flex-wrap items-stretch overflow-hidden rounded-md border border-border bg-background px-4 py-2 shadow-sm sm:mx-0 sm:px-0 sm:py-0"
      >
        {ABAS.map((a) => (
          <button
            key={a.v}
            role="tab"
            aria-selected={aba === a.v}
            onClick={() => setAba(a.v)}
            className={
              'flex items-center gap-2 border-r border-border px-4 py-2.5 text-sm font-medium transition-colors last:border-r-0 ' +
              (aba === a.v
                ? 'bg-foreground text-background'
                : 'bg-background text-muted-foreground hover:bg-secondary hover:text-foreground')
            }
          >
            <span className="font-mono text-[10px] opacity-60">{a.num}</span>
            {a.label}
          </button>
        ))}
      </div>

      <div className="mt-8" data-testid="painel-aba">
        <p className="eyebrow text-muted-foreground">
          <span className="font-mono mr-2">{abaAtual.num}</span>
          {abaAtual.label}
        </p>
        <div className="mt-4">
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
          {aba === 'agenda' ? <AbaAgenda casaId={casa.id} /> : null}
        </div>
      </div>
    </section>
  );
}
