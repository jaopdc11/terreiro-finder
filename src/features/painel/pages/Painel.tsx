import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  User2,
  Calendar,
  MapPin,
  BookOpen,
  ImageIcon,
  Shield,
  Check,
  ExternalLink,
  ChevronLeft,
  PlusCircle,
  AlertCircle,
} from 'lucide-react';
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
import type { LucideIcon } from 'lucide-react';

type Aba = 'perfil' | 'endereco' | 'tradicao' | 'fotos' | 'abertura' | 'agenda';

const ABAS_VALIDAS = new Set<Aba>(['perfil', 'endereco', 'tradicao', 'fotos', 'abertura', 'agenda']);

const ABAS: { v: Aba; label: string; num: string; Icon: LucideIcon; desc: string }[] = [
  { v: 'perfil', label: 'Perfil', num: '01', Icon: User2, desc: 'Nome, sacerdote e contato' },
  { v: 'agenda', label: 'Agenda', num: '02', Icon: Calendar, desc: 'Giras e eventos' },
  { v: 'endereco', label: 'Endereço', num: '03', Icon: MapPin, desc: 'Localização e pino no mapa' },
  { v: 'tradicao', label: 'Tradição', num: '04', Icon: BookOpen, desc: 'Campos específicos da tradição' },
  { v: 'fotos', label: 'Fotos', num: '05', Icon: ImageIcon, desc: 'Galeria pública da casa' },
  { v: 'abertura', label: 'Abertura', num: '06', Icon: Shield, desc: 'Visitas, endereço e imagem' },
];

export function Painel() {
  const { sessao } = useServices();
  const nome = sessao.use((s) => s.sessao?.nomeExibicao);
  const { data: casas, isLoading } = useMinhasCasas();
  const [casaSelecionada, setCasaSelecionada] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="container py-20 text-xs uppercase tracking-widest text-muted-foreground" role="status">
        Carregando suas casas…
      </div>
    );
  }

  if (casas && casas.length === 1) {
    return <PainelDeCasa casaId={casas[0]!.id} casaUnica />;
  }

  if (!casas || casas.length === 0) {
    return (
      <div>
        <div className="hero-gradient border-b border-border">
          <div className="container max-w-3xl py-12 md:py-16">
            <p className="eyebrow eyebrow-ornado inline-flex items-center">Painel da dirigência</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Olá,{' '}
              <span className="display-serif italic text-primary">{nome ?? 'dirigente'}</span>.
            </h1>
            <p className="mt-3 max-w-lg text-muted-foreground">
              Sua conta ainda não está vinculada a nenhuma casa.
            </p>
          </div>
        </div>

        <div className="container max-w-3xl py-10">
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              to="/cadastrar"
              className="card-soft card-soft-hover group flex flex-col gap-3 p-6 transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-primary">
                <PlusCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground group-hover:text-primary">
                  Cadastrar minha casa
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Você é dirigente. Cadastre e a casa nasce verificada.
                </p>
              </div>
            </Link>

            <Link
              to="/reivindicar"
              className="card-soft card-soft-hover group flex flex-col gap-3 p-6 transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Reivindicar casa existente</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sua casa já está cadastrada como <em>não verificada</em>? Reivindique aqui.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!casaSelecionada) {
    return (
      <div>
        <div className="hero-gradient border-b border-border">
          <div className="container max-w-4xl py-12 md:py-16">
            <p className="eyebrow eyebrow-ornado inline-flex items-center">Painel da dirigência</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Olá,{' '}
              <span className="display-serif italic text-primary">{nome ?? 'dirigente'}</span>.
            </h1>
            <p className="mt-3 text-muted-foreground">
              Selecione a casa que deseja editar.
            </p>
          </div>
        </div>

        <div className="container max-w-4xl py-10">
          <ul className="space-y-3">
            {casas.map((c, idx) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setCasaSelecionada(c.id)}
                  className="card-soft card-soft-hover group w-full p-5 text-left transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <span className="mt-1 font-mono text-xs text-primary">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <p className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          {c.nome}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          <span className="eyebrow text-xs normal-case tracking-normal">
                            {c.tradicaoPrincipal}
                          </span>
                          {' · '}
                          {c.cidade}/{c.estado}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`mt-0.5 shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                        c.estaVerificada()
                          ? 'border-primary/30 bg-primary/5 text-primary'
                          : 'border-border bg-background text-muted-foreground'
                      }`}
                    >
                      {c.estaVerificada() && <Check className="h-3 w-3" />}
                      {c.estaVerificada() ? 'Verificada' : 'Não verificada'}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-8 border-t border-border pt-6">
            <Link
              to="/cadastrar"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <PlusCircle className="h-4 w-4" />
              Cadastrar outra casa
            </Link>
          </div>
        </div>
      </div>
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
  casaUnica = false,
  onVoltar,
}: {
  casaId: string;
  casaUnica?: boolean;
  onVoltar?(): void;
}) {
  const { data: casa, isLoading } = useCasaDoPainel(casaId);
  const [searchParams, setSearchParams] = useSearchParams();
  const abaParam = searchParams.get('aba');
  const aba: Aba = ABAS_VALIDAS.has(abaParam as Aba) ? (abaParam as Aba) : 'perfil';
  const setAba = (a: Aba) => setSearchParams({ aba: a }, { replace: true });

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
        <p className="text-2xl font-semibold">Casa não encontrada.</p>
        {onVoltar && (
          <button
            onClick={onVoltar}
            className="mt-6 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </button>
        )}
      </div>
    );
  }

  const abaInfo = ABAS.find((a) => a.v === aba) ?? ABAS[0]!;

  return (
    <div>
      {/* ── Cabeçalho da casa ── */}
      <div className="hero-gradient border-b border-border">
        <div className="container max-w-5xl py-8 md:py-10">
          {!casaUnica && onVoltar && (
            <button
              onClick={onVoltar}
              className="mb-6 flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Outras casas
            </button>
          )}

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow eyebrow-ornado inline-flex items-center">
                {casa.tradicaoPrincipal} · {casa.cidade}/{casa.estado}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                {casa.nome}
              </h1>
              {casa.sacerdoteNome && (
                <p className="mt-1.5 display-serif text-lg italic text-muted-foreground">
                  {casa.sacerdoteNome}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                    casa.estaVerificada()
                      ? 'border-primary/30 bg-primary/5 text-primary'
                      : 'border-border bg-background text-muted-foreground'
                  }`}
                >
                  {casa.estaVerificada() && <Check className="h-3 w-3" />}
                  {casa.estaVerificada() ? 'Verificada' : 'Não verificada'}
                </span>
              </div>
            </div>

            <Link
              to={`/casa/${String(casa.slug)}`}
              className="hidden shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground md:flex"
            >
              Ver ficha pública
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Layout: nav lateral + conteúdo ── */}
      <div className="container max-w-5xl py-8 pb-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr] md:gap-10">

          {/* Navegação lateral (desktop) */}
          <aside className="hidden md:block">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Seções
            </p>
            <nav>
              <ul className="space-y-0.5">
                {ABAS.map((a) => {
                  const ativo = aba === a.v;
                  return (
                    <li key={a.v}>
                      <button
                        type="button"
                        onClick={() => setAba(a.v)}
                        className={`group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                          ativo
                            ? 'bg-foreground text-background'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        }`}
                      >
                        <a.Icon
                          className={`h-4 w-4 shrink-0 ${ativo ? 'opacity-90' : 'opacity-60 group-hover:opacity-80'}`}
                        />
                        {a.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-8 border-t border-border pt-6">
              <Link
                to={`/casa/${String(casa.slug)}`}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Ver ficha pública
              </Link>
            </div>
          </aside>

          {/* Área de conteúdo */}
          <div>
            {/* Tabs mobile (overflow scroll) */}
            <div
              role="tablist"
              className="mb-6 flex gap-1 overflow-x-auto rounded-lg border border-border bg-muted/40 p-1 md:hidden"
            >
              {ABAS.map((a) => (
                <button
                  key={a.v}
                  role="tab"
                  aria-selected={aba === a.v}
                  onClick={() => setAba(a.v)}
                  className={`flex-none whitespace-nowrap rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                    aba === a.v
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>

            {/* Cabeçalho da seção */}
            <div className="mb-6 border-b border-border pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted">
                  <abaInfo.Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{abaInfo.num}</p>
                  <h2 className="text-lg font-semibold leading-tight tracking-tight">
                    {abaInfo.label}
                  </h2>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{abaInfo.desc}</p>
            </div>

            {/* Conteúdo da aba */}
            <div data-testid="painel-aba">
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
                  <p className="text-sm text-muted-foreground">
                    Editor para tradição{' '}
                    <strong className="text-foreground">{casa.tradicaoPrincipal}</strong>{' '}
                    chega numa próxima fase.
                  </p>
                )
              ) : null}
              {aba === 'fotos' ? <AbaFotos casaId={casa.id} /> : null}
              {aba === 'agenda' ? <AbaAgenda casaId={casa.id} /> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
