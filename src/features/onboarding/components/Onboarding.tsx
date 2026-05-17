import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { useTeclaEsc } from '@/shared/hooks/useTeclaEsc';
import { useOnboardingStore, type Bifurcacao } from '../stores/onboardingStore';

export function Onboarding() {
  const passo = useOnboardingStore((s) => s.passo);
  const bifurcacao = useOnboardingStore((s) => s.bifurcacao);
  const concluido = useOnboardingStore((s) => s.concluido);
  const avancar = useOnboardingStore((s) => s.avancar);
  const voltar = useOnboardingStore((s) => s.voltar);
  const escolherBifurcacao = useOnboardingStore((s) => s.escolherBifurcacao);
  const pular = useOnboardingStore((s) => s.pular);
  const concluir = useOnboardingStore((s) => s.concluir);
  const navigate = useNavigate();

  // Esc pula o onboarding (mesma semântica do botão "Pular").
  useTeclaEsc(!concluido, pular);

  if (concluido) return null;

  const finalizar = (b: Bifurcacao) => {
    escolherBifurcacao(b);
    concluir();
    navigate(b === 'visitante' ? '/' : '/cadastrar');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-titulo"
      data-testid="onboarding"
      className="fixed inset-0 z-[2100] flex items-center justify-center bg-foreground/40 p-4"
    >
      <div className="w-full max-w-lg rounded-lg bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Passo {passo + 1} de 3
          </span>
          <button
            type="button"
            onClick={pular}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Pular
          </button>
        </div>

        {passo === 0 ? (
          <div className="mt-4">
            <h2 id="onboarding-titulo" className="font-display text-2xl">
              Salve. Bom ter você por aqui.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Aqui é um lugar pra encontrar terreiros — Umbanda, Candomblé,
              Quimbanda, Omolocô, Xambá. <strong>Cada casa fala por si</strong>;
              a gente só ajuda na descoberta.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={avancar}>Bora</Button>
            </div>
          </div>
        ) : null}

        {passo === 1 ? (
          <div className="mt-4">
            <h2 id="onboarding-titulo" className="font-display text-2xl">
              Tu procura uma casa, ou é da dirigência?
            </h2>
            <p className="mt-2 text-muted-foreground">
              A escolha guia o próximo passo. Dá pra mudar depois.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button
                variant={bifurcacao === 'visitante' ? 'default' : 'outline'}
                onClick={() => escolherBifurcacao('visitante')}
              >
                Procuro uma casa
              </Button>
              <Button
                variant={bifurcacao === 'dirigencia' ? 'default' : 'outline'}
                onClick={() => escolherBifurcacao('dirigencia')}
              >
                Sou da dirigência
              </Button>
            </div>
            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={voltar}>
                Voltar
              </Button>
              <Button onClick={avancar} disabled={!bifurcacao}>
                Avançar
              </Button>
            </div>
          </div>
        ) : null}

        {passo === 2 ? (
          <div className="mt-4">
            <h2 id="onboarding-titulo" className="font-display text-2xl">
              {bifurcacao === 'dirigencia' ? 'Vamos cadastrar tua casa.' : 'Vamos procurar uma casa.'}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {bifurcacao === 'dirigencia'
                ? 'Cadastro é gratuito. Você controla o quanto a casa aparece.'
                : 'Mapa e filtros aguardam. Quem é do santo, reconhece.'}
            </p>
            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={voltar}>
                Voltar
              </Button>
              <Button onClick={() => finalizar(bifurcacao ?? 'visitante')}>
                {bifurcacao === 'dirigencia' ? 'Cadastrar minha casa' : 'Procurar casa'}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
