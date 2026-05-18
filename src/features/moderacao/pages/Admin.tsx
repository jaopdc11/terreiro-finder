import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  useAprovarCadastroDireto,
  useAprovarIndicacao,
  useAprovarReivindicacao,
  useCadastrosDiretosPendentes,
  useCasasPendentesDeConsentimento,
  useConfirmarConsentimento,
  useIndicacoesPendentes,
  useRecusarCadastroDireto,
  useRecusarIndicacao,
  useRecusarReivindicacao,
  useReivindicacoesPendentes,
} from '../hooks/useFilaModeracao';

type Aba = 'passo-1' | 'passo-2' | 'reivindicacoes' | 'cadastros';

export function Admin() {
  const [aba, setAba] = useState<Aba>('passo-1');

  return (
    <section className="container max-w-6xl py-16">
      <header className="border-b border-border pb-8">
        <p className="eyebrow eyebrow-ornado inline-flex items-center">Admin</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Moderação
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Indicações entram em duas etapas: validar e confirmar consentimento
          da casa. Reivindicações exigem contato cruzado pelo canal já
          registrado antes da aprovação.
        </p>
      </header>

      <div
        role="tablist"
        className="mt-8 flex flex-wrap items-stretch overflow-hidden rounded-md border border-border"
      >
        <TabButton ativo={aba === 'passo-1'} onClick={() => setAba('passo-1')} num="01">
          Indicações pendentes
        </TabButton>
        <TabButton ativo={aba === 'passo-2'} onClick={() => setAba('passo-2')} num="02">
          Confirmar consentimento
        </TabButton>
        <TabButton
          ativo={aba === 'reivindicacoes'}
          onClick={() => setAba('reivindicacoes')}
          num="03"
        >
          Reivindicações
        </TabButton>
        <TabButton
          ativo={aba === 'cadastros'}
          onClick={() => setAba('cadastros')}
          num="04"
        >
          Cadastros novos
        </TabButton>
      </div>

      <div className="pt-10">
        {aba === 'passo-1' ? <Passo1 /> : null}
        {aba === 'passo-2' ? <Passo2 /> : null}
        {aba === 'reivindicacoes' ? <Reivindicacoes /> : null}
        {aba === 'cadastros' ? <CadastrosDiretos /> : null}
      </div>
    </section>
  );
}

function TabButton({
  ativo,
  onClick,
  num,
  children,
}: {
  ativo: boolean;
  onClick(): void;
  num: string;
  children: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={ativo}
      onClick={onClick}
      className={
        'flex items-center gap-2 border-r border-border px-4 py-2.5 text-sm font-medium transition-colors last:border-r-0 ' +
        (ativo
          ? 'bg-foreground text-background'
          : 'bg-background text-muted-foreground hover:bg-secondary hover:text-foreground')
      }
    >
      <span className="font-mono text-[10px] opacity-60">{num}</span>
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
        <li key={ind.id} className="border border-foreground/15 bg-background p-5 transition-colors hover:border-foreground/40">
          <header className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl leading-tight">{ind.nome}</h2>
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
        <li key={c.id} className="border border-foreground/15 bg-background p-5 transition-colors hover:border-foreground/40">
          <header className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl leading-tight">{c.nome}</h2>
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

type CasaJoin = {
  slug: string;
  nome: string;
  whatsapp: string | null;
  telefone: string | null;
  email_contato: string | null;
};

type ReivindicacaoComCasa = {
  id: string;
  user_id: string;
  casa_id: string;
  observacoes: string | null;
  status: string;
  created_at: string;
  casa: CasaJoin | CasaJoin[] | null;
};

function casaDaJoin(c: CasaJoin | CasaJoin[] | null): CasaJoin | null {
  if (!c) return null;
  return Array.isArray(c) ? c[0] ?? null : c;
}

function Reivindicacoes() {
  const { data, isLoading } = useReivindicacoesPendentes();
  const aprovar = useAprovarReivindicacao();
  const recusar = useRecusarReivindicacao();
  const [motivos, setMotivos] = useState<Record<string, string>>({});

  if (isLoading) return <p className="text-muted-foreground">Carregando…</p>;
  const itens = (data ?? []) as unknown as ReivindicacaoComCasa[];
  if (itens.length === 0) {
    return (
      <p className="text-muted-foreground">
        Nenhuma reivindicação pendente. Conforme pessoas reivindicarem casas não
        verificadas, elas aparecem aqui.
      </p>
    );
  }

  return (
    <ul className="space-y-3" data-testid="lista-reivindicacoes-pendentes">
      {itens.map((r) => {
        const casa = casaDaJoin(r.casa);
        return (
          <li key={r.id} className="border border-foreground/15 bg-background p-5 transition-colors hover:border-foreground/40">
            <header>
              <h2 className="font-display text-xl leading-tight">
                {casa?.nome ?? 'Casa removida'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Pedido criado em{' '}
                {new Date(r.created_at).toLocaleDateString('pt-BR')}
              </p>
            </header>

            <div className="mt-3 border-l-2 border-foreground/30 bg-muted/40 p-3 text-sm">
              <p className="font-medium text-foreground">
                Contate pelos canais já registrados da casa:
              </p>
              <ul className="mt-1 space-y-0.5">
                {casa?.whatsapp ? (
                  <li>📱 WhatsApp: <code>{casa.whatsapp}</code></li>
                ) : null}
                {casa?.telefone ? (
                  <li>☎ Telefone: <code>{casa.telefone}</code></li>
                ) : null}
                {casa?.email_contato ? (
                  <li>✉ Email: <code>{casa.email_contato}</code></li>
                ) : null}
                {!casa?.whatsapp && !casa?.telefone && !casa?.email_contato ? (
                  <li className="text-muted-foreground">
                    Nenhum canal registrado — busca o Instagram da casa pelo
                    nome.
                  </li>
                ) : null}
              </ul>
            </div>

            {r.observacoes ? (
              <div className="mt-3 text-sm">
                <p className="font-medium">O que a pessoa disse:</p>
                <p className="mt-1 whitespace-pre-line text-foreground/90">
                  {r.observacoes}
                </p>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={aprovar.isPending}
                onClick={() => aprovar.mutate(r.id)}
              >
                Casa confirmou — aprovar
              </Button>
              <div className="flex flex-1 gap-2">
                <Input
                  placeholder="Motivo da recusa"
                  value={motivos[r.id] ?? ''}
                  onChange={(e) =>
                    setMotivos((m) => ({ ...m, [r.id]: e.target.value }))
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={recusar.isPending}
                  onClick={() =>
                    recusar.mutate({ id: r.id, motivo: motivos[r.id] ?? '' })
                  }
                >
                  Recusar
                </Button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

type PerfilJoin = { nome_exibicao: string | null; nome_completo: string | null };
type CasaCadastroDireto = {
  id: string;
  slug: string;
  nome: string;
  sacerdote_nome: string | null;
  tradicao_principal: string;
  cidade: string;
  estado: string;
  bairro: string | null;
  criada_por: string | null;
  canal_validacao: string | null;
  created_at: string;
  criador: PerfilJoin | PerfilJoin[] | null;
};

function nomeCriador(p: PerfilJoin | PerfilJoin[] | null): string {
  if (!p) return "—";
  const obj = Array.isArray(p) ? (p[0] ?? null) : p;
  return obj?.nome_exibicao ?? obj?.nome_completo ?? "—";
}

function CadastrosDiretos() {
  const { data, isLoading } = useCadastrosDiretosPendentes();
  const aprovar = useAprovarCadastroDireto();
  const recusar = useRecusarCadastroDireto();
  const [motivos, setMotivos] = useState<Record<string, string>>({});

  if (isLoading) return <p className="text-muted-foreground">Carregando…</p>;
  const itens = (data ?? []) as unknown as CasaCadastroDireto[];
  if (itens.length === 0) {
    return (
      <p className="text-muted-foreground">
        Nenhum cadastro direto pendente. Quando alguém usar o /cadastrar,
        aparece aqui.
      </p>
    );
  }

  return (
    <ul className="space-y-3" data-testid="lista-cadastros-pendentes">
      {itens.map((c) => {
        const motivo = motivos[c.id]?.trim() ?? '';
        return (
          <li key={c.id} className="border border-foreground/15 bg-background p-5 transition-colors hover:border-foreground/40">
            <header className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-xl leading-tight">{c.nome}</h2>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {c.tradicao_principal}
              </span>
            </header>
            <p className="mt-1 text-sm text-muted-foreground">
              {c.bairro ? `${c.bairro}, ` : ''}{c.cidade}/{c.estado}
            </p>
            <p className="mt-2 text-sm">
              <strong>Cadastrado por:</strong> {nomeCriador(c.criador)}
              {c.sacerdote_nome ? <> · <strong>Sacerdote:</strong> {c.sacerdote_nome}</> : null}
            </p>

            {c.canal_validacao ? (
              <div className="mt-3 border-l-2 border-foreground/30 bg-muted/40 p-3 text-sm">
                <p className="font-medium text-foreground">
                  Como validar a dirigência (contato cruzado):
                </p>
                <p className="mt-1 whitespace-pre-line text-foreground/90">
                  {c.canal_validacao}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-destructive">
                Sem canal de validação informado — recuse ou contate o cadastrante
                direto via email do perfil.
              </p>
            )}

            <p className="mt-3 text-sm text-muted-foreground">
              <strong>Atenção:</strong> só clique em "Validei" depois de contatar
              pelo canal acima e confirmar que essa pessoa é da dirigência.
              Aprovar vincula como dirigente principal e publica a casa{' '}
              <strong>verificada</strong>.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={aprovar.isPending}
                onClick={() => aprovar.mutate(c.id)}
              >
                Validei dirigência — publicar
              </Button>
              <div className="flex flex-1 gap-2">
                <Input
                  placeholder="Motivo da recusa (opcional)"
                  value={motivos[c.id] ?? ''}
                  onChange={(e) =>
                    setMotivos((m) => ({ ...m, [c.id]: e.target.value }))
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={recusar.isPending}
                  onClick={() =>
                    recusar.mutate({
                      casaId: c.id,
                      motivo: motivo.length > 0 ? motivo : null,
                    })
                  }
                >
                  Recusar
                </Button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
