import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  useAprovarIndicacao,
  useCasasPendentesDeConsentimento,
  useConfirmarConsentimento,
  useIndicacoesPendentes,
  useRecusarIndicacao,
} from '../hooks/useFilaModeracao';

type Aba = 'passo-1' | 'passo-2';

export function Admin() {
  const [aba, setAba] = useState<Aba>('passo-1');

  return (
    <section className="container max-w-5xl py-8">
      <h1 className="font-display text-3xl">Moderação</h1>
      <p className="mt-2 text-muted-foreground">
        Indicações entram em duas etapas: <strong>validar</strong> (passo 1) e
        depois <strong>confirmar consentimento</strong> da casa contatada (passo
        2). Casa só fica pública depois do passo 2.
      </p>

      <div role="tablist" className="mt-6 flex gap-2 border-b border-border">
        <TabButton ativo={aba === 'passo-1'} onClick={() => setAba('passo-1')}>
          Passo 1 — Indicações pendentes
        </TabButton>
        <TabButton ativo={aba === 'passo-2'} onClick={() => setAba('passo-2')}>
          Passo 2 — Confirmar consentimento
        </TabButton>
      </div>

      <div className="mt-6">{aba === 'passo-1' ? <Passo1 /> : <Passo2 />}</div>
    </section>
  );
}

function TabButton({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick(): void;
  children: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={ativo}
      onClick={onClick}
      className={
        'border-b-2 px-3 py-2 text-sm font-medium ' +
        (ativo
          ? 'border-primary text-primary'
          : 'border-transparent text-muted-foreground hover:text-foreground')
      }
    >
      {children}
    </button>
  );
}

function Passo1() {
  const { data: indicacoes, isLoading } = useIndicacoesPendentes();
  const aprovar = useAprovarIndicacao();
  const recusar = useRecusarIndicacao();
  const [motivos, setMotivos] = useState<Record<string, string>>({});

  if (isLoading) return <p className="text-muted-foreground">Carregando…</p>;
  if (!indicacoes || indicacoes.length === 0) {
    return <p className="text-muted-foreground">Nenhuma indicação pendente.</p>;
  }

  return (
    <ul className="space-y-3" data-testid="lista-indicacoes-pendentes">
      {indicacoes.map((ind) => (
        <li key={ind.id} className="rounded-lg border border-border bg-card p-4">
          <header className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-lg">{ind.nome}</h2>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {ind.tradicaoPrincipal ?? 'tradição não informada'}
            </span>
          </header>
          <p className="mt-1 text-sm text-muted-foreground">
            {ind.bairro ? `${ind.bairro}, ` : ''}
            {ind.cidade}/{ind.estado}
          </p>
          {ind.canalContato ? (
            <p className="mt-2 text-sm">
              <strong>Canal pra contatar:</strong> {ind.canalContato}
            </p>
          ) : null}
          {ind.observacoes ? (
            <p className="mt-2 whitespace-pre-line text-sm">{ind.observacoes}</p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={aprovar.isPending}
              onClick={() => aprovar.mutate(ind.id)}
            >
              Validar e criar casa pendente
            </Button>
            <div className="flex flex-1 gap-2">
              <Input
                placeholder="Motivo da recusa"
                value={motivos[ind.id] ?? ''}
                onChange={(e) =>
                  setMotivos((m) => ({ ...m, [ind.id]: e.target.value }))
                }
              />
              <Button
                variant="outline"
                size="sm"
                disabled={recusar.isPending}
                onClick={() =>
                  recusar.mutate({ id: ind.id, motivo: motivos[ind.id] ?? '' })
                }
              >
                Recusar
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Passo2() {
  const { data: casas, isLoading } = useCasasPendentesDeConsentimento();
  const confirmar = useConfirmarConsentimento();

  if (isLoading) return <p className="text-muted-foreground">Carregando…</p>;
  if (!casas || casas.length === 0) {
    return (
      <p className="text-muted-foreground">
        Nenhuma casa aguardando confirmação. Conforme indicações forem validadas
        no passo 1, elas aparecem aqui.
      </p>
    );
  }

  return (
    <ul className="space-y-3" data-testid="lista-casas-pendentes">
      {casas.map((c) => (
        <li key={c.id} className="rounded-lg border border-border bg-card p-4">
          <header className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-lg">{c.nome}</h2>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {c.tradicao_principal}
            </span>
          </header>
          <p className="mt-1 text-sm text-muted-foreground">
            {c.bairro ? `${c.bairro}, ` : ''}
            {c.cidade}/{c.estado}
          </p>
          <p className="mt-2 text-sm">
            Já validamos a indicação. Contate a casa pelo canal que o indicador
            passou. Só clique abaixo depois que a dirigência <strong>autorizar
            explicitamente</strong> a presença no site.
          </p>

          <div className="mt-4">
            <Button
              size="sm"
              disabled={confirmar.isPending}
              onClick={() => confirmar.mutate(c.id)}
            >
              Casa autorizou — publicar
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
