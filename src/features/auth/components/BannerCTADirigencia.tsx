import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useServices } from '@/shared/hooks/useServices';
import { useMinhasCasas } from '@/features/painel/hooks/usePainel';

const DISPENSADO_KEY = 'terreiros.banner-cta-dirigencia';

/**
 * Banner mostrado abaixo do Header quando a sessão é dirigência E ainda
 * não tem casa vinculada. Convida a ir pro wizard /cadastrar.
 *
 * Renderização condicional (3 caminhos pra ocultar):
 *   - Sem sessão ou não-dirigência: null
 *   - Já tem casa vinculada: null (jornada concluída)
 *   - User dispensou nesta sessão: null (persistido no localStorage)
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
      className="border-b border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"
    >
      <div className="container flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
        <p className="text-foreground/90">
          <span aria-hidden="true" className="mr-1.5">🪔</span>
          <strong>Axé, {estado.sessao.nomeExibicao}.</strong> Você se cadastrou
          como dirigência — vamos registrar sua casa?
        </p>
        <div className="flex items-center gap-2">
          <Link
            to="/cadastrar"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground shadow-warm-sm transition-all hover:bg-terra-pemba-escuro hover:shadow-warm"
          >
            Cadastrar minha casa
          </Link>
          <button
            type="button"
            onClick={dispensar}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Dispensar este aviso"
          >
            depois
          </button>
        </div>
      </div>
    </aside>
  );
}
