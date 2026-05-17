import { Navigate, useLocation, type Location } from 'react-router-dom';
import { useServices } from '@/shared/hooks/useServices';
import type { UserRole } from '@/features/auth/schemas';

interface Props {
  children: React.ReactNode;
  /** Se informado, exige role exata ou superior (admin > dirigente > visitante). */
  role?: UserRole;
}

const RANK: Record<UserRole, number> = { visitante: 0, dirigente: 1, admin: 2 };

export function Protegido({ children, role }: Props) {
  const { sessao } = useServices();
  const estado = sessao.use((s) => s);
  const location: Location = useLocation();

  if (estado.carregando) {
    return (
      <div className="container py-12 text-muted-foreground" role="status" aria-live="polite">
        Carregando…
      </div>
    );
  }

  if (!estado.sessao) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (role && RANK[estado.sessao.role] < RANK[role]) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
