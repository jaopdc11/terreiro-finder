import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useServices } from '@/shared/hooks/useServices';
import { useCasaDoPainel, useMinhasCasas } from '../hooks/usePainel';
import { AbaPerfil } from '../components/AbaPerfil';
import { AbaAbertura } from '../components/AbaAbertura';
import { AbaEndereco } from '../components/AbaEndereco';
import { AbaTradicaoUmbanda } from '../components/AbaTradicaoUmbanda';
import { AbaFotos } from '../components/AbaFotos';

type Aba = 'perfil' | 'endereco' | 'tradicao' | 'fotos' | 'abertura';

export function Painel() {
  const { sessao } = useServices();
  const nome = sessao.use((s) => s.sessao?.nomeExibicao);
  const { data: casas, isLoading } = useMinhasCasas();
  const [casaSelecionada, setCasaSelecionada] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="container py-12 text-muted-foreground" role="status">
        Carregando suas casas…
      </div>
    );
  }

  if (!casas || casas.length === 0) {
    return (
      <section className="container max-w-2xl py-12">
        <h1 className="font-display text-3xl">Painel da dirigência</h1>
        <p className="mt-4 text-muted-foreground">
          Salve, {nome}. Você ainda não está vinculada(o) a nenhuma casa neste
          painel.
        </p>
        <p className="mt-2 text-muted-foreground">
          Se você é dirigente de uma casa que já está aqui mas marcada como{' '}
          <strong>não verificada</strong>, abre a ficha dela e clica em{' '}
          <strong>Reivindique aqui</strong>. Depois que confirmarmos, ela
          aparece neste painel.
        </p>
        <Link to="/" className="mt-6 inline-block text-primary hover:underline">
          Ver casas
        </Link>
      </section>
    );
  }

  if (!casaSelecionada) {
    return (
      <section className="container max-w-2xl py-12">
        <h1 className="font-display text-3xl">Painel da dirigência</h1>
        <p className="mt-2 text-muted-foreground">
          Salve, {nome}. Escolha uma casa pra editar.
        </p>
        <ul className="mt-6 space-y-3">
          {casas.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setCasaSelecionada(c.id)}
                className="block w-full rounded-lg border border-border bg-card p-4 text-left hover:bg-muted"
              >
                <h2 className="font-display text-lg">{c.nome}</h2>
                <p className="text-xs text-muted-foreground">
                  {c.tradicaoPrincipal} · {c.cidade}/{c.estado}
                  {c.estaVerificada() ? ' · verificada' : ' · não verificada'}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return <PainelDeCasa casaId={casaSelecionada} onVoltar={() => setCasaSelecionada(null)} />;
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
    return <div className="container py-12 text-muted-foreground">Carregando…</div>;
  }
  if (!casa) {
    return (
      <div className="container py-12">
        <p>Casa não encontrada.</p>
        <button onClick={onVoltar} className="mt-4 text-primary hover:underline">
          Voltar
        </button>
      </div>
    );
  }

  return (
    <section className="container max-w-4xl py-8">
      <button
        onClick={onVoltar}
        className="text-sm text-muted-foreground hover:text-primary"
      >
        ← Outras casas
      </button>
      <h1 className="mt-2 font-display text-3xl">{casa.nome}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {casa.tradicaoPrincipal} · {casa.cidade}/{casa.estado}
        {casa.estaVerificada() ? ' · verificada' : ' · não verificada'}
      </p>

      <div role="tablist" className="mt-6 flex flex-wrap gap-2 border-b border-border">
        <TabBtn ativo={aba === 'perfil'} onClick={() => setAba('perfil')}>
          Perfil
        </TabBtn>
        <TabBtn ativo={aba === 'endereco'} onClick={() => setAba('endereco')}>
          Endereço
        </TabBtn>
        <TabBtn ativo={aba === 'tradicao'} onClick={() => setAba('tradicao')}>
          Tradição
        </TabBtn>
        <TabBtn ativo={aba === 'fotos'} onClick={() => setAba('fotos')}>
          Fotos
        </TabBtn>
        <TabBtn ativo={aba === 'abertura'} onClick={() => setAba('abertura')}>
          Abertura
        </TabBtn>
      </div>

      <div className="mt-6" data-testid="painel-aba">
        {aba === 'perfil' ? <AbaPerfil casa={casa} /> : null}
        {aba === 'endereco' ? <AbaEndereco casa={casa} /> : null}
        {aba === 'abertura' ? <AbaAbertura casa={casa} /> : null}
        {aba === 'tradicao' ? (
          casa.tradicaoPrincipal === 'umbanda' ? (
            <AbaTradicaoUmbanda casaId={casa.id} />
          ) : (
            <p className="text-muted-foreground">
              Editor para tradição{' '}
              <strong>{casa.tradicaoPrincipal}</strong> chega numa próxima
              fase. Por enquanto, o bloco específico está só em Umbanda.
            </p>
          )
        ) : null}
        {aba === 'fotos' ? <AbaFotos casaId={casa.id} /> : null}
      </div>
    </section>
  );
}

function TabBtn({
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
