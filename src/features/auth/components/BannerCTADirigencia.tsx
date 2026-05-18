import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useServices } from '@/shared/hooks/useServices';
import { useMinhasCasas } from '@/features/painel/hooks/usePainel';

const DISPENSADO_KEY = 'encruza.banner-cta-dirigencia';

/**
 * Banner abaixo do header para dirigência sem casa vinculada. Estilo
 * Linear-like: linha sutil, tipografia sentence case, CTA primário discreto.
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
      className="border-b border-border bg-primary/5"
    >
      <div className="container flex flex-wrap items-center justify-between gap-4 py-2.5 text-sm">
        <p className="text-foreground/85">
          <strong className="font-semibold text-foreground">
            {estado.sessao.nomeExibicao}
          </strong>{' '}
          — sua conta foi criada como dirigência. Deseja registrar sua casa
          agora?
        </p>
        <div className="flex items-center gap-2">
          <Link
            to="/cadastrar"
            className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
          >
            Cadastrar casa
          </Link>
          <button
            type="button"
            onClick={dispensar}
            className="text-xs text-muted-foreground hover:text-foreground"
            aria-label="Dispensar este aviso"
          >
            Mais tarde
          </button>
        </div>
      </div>
    </aside>
  );
}
