import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useServices } from '@/shared/hooks/useServices';
import { useMinhasCasas } from '@/features/painel/hooks/usePainel';

const DISPENSADO_KEY = 'terreiros.banner-cta-dirigencia';

/**
 * Banner abaixo do header pra dirigência sem casa vinculada. Estilo
 * minimalista: fundo escuro, linhas marcantes, sem ornamento colorido.
 */
export function BannerCTADirigencia() {
  const { sessao } = useServices();
  const estado = sessao.use((s) => s);
  const { data: minhasCasas, isLoading } = useMinhasCasas();
  const [dispensado, setDispensado] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DISPENSADO_KEY) === 'true';
    } catch {
      return false;
    }
  });

  if (
    estado.carregando ||
    !estado.sessao ||
    !estado.sessao.ehDirigente() ||
    estado.sessao.podeAdministrar()
  ) {
    return null;
  }
  if (isLoading) return null;
  if ((minhasCasas?.length ?? 0) > 0) return null;
  if (dispensado) return null;

  const dispensar = () => {
    try {
      localStorage.setItem(DISPENSADO_KEY, 'true');
    } catch {
      // privacy mode etc — segue
    }
    setDispensado(true);
  };

  return (
    <aside
      role="region"
      aria-label="Cadastre sua casa"
      className="border-b border-foreground bg-foreground text-background"
    >
      <div className="container flex flex-wrap items-center justify-between gap-4 py-3 text-sm">
        <p className="flex items-baseline gap-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
            Ação
          </span>
          <span>
            Axé, <strong>{estado.sessao.nomeExibicao}</strong> — você se
            cadastrou como dirigência. Vamos registrar sua casa?
          </span>
        </p>
        <div className="flex items-center gap-3">
          <Link
            to="/cadastrar"
            className="border border-background px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-background transition-colors hover:bg-background hover:text-foreground"
          >
            Cadastrar
          </Link>
          <button
            type="button"
            onClick={dispensar}
            className="text-xs uppercase tracking-wider text-background/60 transition-colors hover:text-background"
            aria-label="Dispensar este aviso"
          >
            Depois
          </button>
        </div>
      </div>
    </aside>
  );
}
