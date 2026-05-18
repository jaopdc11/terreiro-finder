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
      className="fixed inset-0 z-[2100] flex items-center justify-center bg-foreground/60 p-4"
    >
      <div className="w-full max-w-xl border-2 border-foreground bg-background p-8">
        <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
          <span className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <span className="flex gap-1" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={
                    'h-0.5 w-6 ' +
                    (i <= passo ? 'bg-primary' : 'bg-foreground/20')
                  }
                />
              ))}
            </span>
            <span className="font-mono">{String(passo + 1).padStart(2, '0')}/03</span>
          </span>
          <button
            type="button"
            onClick={pular}
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            Pular
          </button>
        </div>

        {passo === 0 ? (
          <div className="mt-8">
            <h2 id="onboarding-titulo" className="text-3xl font-semibold tracking-tight">
              Bem-vindo. Axé.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Este é um espaço para encontrar terreiros — Umbanda, Candomblé,
              Quimbanda, Omolocô, Xambá.{' '}
              <strong>Cada casa fala por si</strong>; ajudamos na descoberta.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="primary" onClick={avancar}>
                Continuar
              </Button>
            </div>
          </div>
        ) : null}

        {passo === 1 ? (
          <div className="mt-8">
            <h2 id="onboarding-titulo" className="text-3xl font-semibold tracking-tight">
              Você procura uma casa ou é da dirigência?
            </h2>
            <p className="mt-2 text-muted-foreground">
              A resposta orienta o próximo passo. Você pode alterar depois.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button
                variant={bifurcacao === 'visitante' ? 'primary' : 'outline'}
                onClick={() => escolherBifurcacao('visitante')}
              >
                Procuro uma casa
              </Button>
              <Button
                variant={bifurcacao === 'dirigencia' ? 'primary' : 'outline'}
                onClick={() => escolherBifurcacao('dirigencia')}
              >
                Sou da dirigência
              </Button>
            </div>
            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={voltar}>
                Voltar
              </Button>
              <Button variant="primary" onClick={avancar} disabled={!bifurcacao}>
                Avançar
              </Button>
            </div>
          </div>
        ) : null}

        {passo === 2 ? (
          <div className="mt-8">
            <h2 id="onboarding-titulo" className="text-3xl font-semibold tracking-tight">
              {bifurcacao === 'dirigencia'
                ? 'Vamos cadastrar a sua casa.'
                : 'Vamos abrir o mapa.'}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {bifurcacao === 'dirigencia'
                ? 'O cadastro é gratuito. Você controla integralmente o que aparece publicamente.'
                : 'O mapa e os filtros estão prontos para a busca.'}
            </p>
            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={voltar}>
                Voltar
              </Button>
              <Button variant="primary" onClick={() => finalizar(bifurcacao ?? 'visitante')}>
                {bifurcacao === 'dirigencia' ? 'Cadastrar minha casa' : 'Abrir o mapa'}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
