import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useServices } from '@/shared/hooks/useServices';
import { useMinhasCasas } from '@/features/painel/hooks/usePainel';

/**
 * Header minimalista geométrico: barra com linha grossa embaixo, sem
 * sombra/blur. Logo à esquerda em uppercase compact; navegação à direita
 * sem ornamento, separada por linhas verticais finas.
 */
export function Header() {
  const { sessao, auth } = useServices();
  const estado = sessao.use((s) => s);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: minhasCasas } = useMinhasCasas();
  const mostrarCadastrar = !!estado.sessao && (minhasCasas?.length ?? 0) === 0;

  const sair = () => {
    sessao.sair();
    void auth.logout().catch(() => {});
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-foreground bg-background">
      <div className="container flex h-16 items-stretch">
        <Link
          to="/"
          className="flex items-center pr-6 text-sm font-bold uppercase tracking-[0.2em] text-foreground hover:text-primary"
          aria-label="terreiros — voltar pra busca"
        >
          terreiros<span className="ml-1 text-primary">.</span>
        </Link>

        <nav
          aria-label="Principal"
          className="ml-auto hidden items-stretch divide-x divide-foreground/10 border-x border-foreground/10 md:flex"
        >
          <NavLink to="/" active={location.pathname === '/'}>
            Buscar
          </NavLink>
          <NavLink to="/indicar" active={location.pathname === '/indicar'}>
            Indicar
          </NavLink>
          {mostrarCadastrar ? (
            <NavLink
              to="/cadastrar"
              active={location.pathname === '/cadastrar'}
              destaque
            >
              Cadastrar casa
            </NavLink>
          ) : null}
          {estado.sessao ? (
            <NavLink to="/painel" active={location.pathname === '/painel'}>
              Painel
            </NavLink>
          ) : null}
          {estado.sessao?.podeAdministrar() ? (
            <NavLink to="/admin" active={location.pathname === '/admin'}>
              Moderação
            </NavLink>
          ) : null}
          <NavLink to="/sobre" active={location.pathname === '/sobre'}>
            Sobre
          </NavLink>
        </nav>

        <div className="ml-auto flex items-stretch md:ml-0">
          {estado.carregando ? null : estado.sessao ? (
            <>
              <span className="hidden items-center px-4 text-xs uppercase tracking-wider text-muted-foreground md:flex">
                {estado.sessao.nomeExibicao}
              </span>
              <button
                onClick={sair}
                className="flex items-center px-5 text-xs font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center px-5 text-xs font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                Entrar
              </Link>
              <Link
                to="/cadastro"
                className="flex items-center bg-foreground px-5 text-xs font-semibold uppercase tracking-wider text-background transition-colors hover:bg-primary"
              >
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({
  to,
  active,
  destaque,
  children,
}: {
  to: string;
  active: boolean;
  destaque?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={
        'flex items-center px-5 text-xs font-semibold uppercase tracking-wider transition-colors ' +
        (active
          ? 'bg-foreground text-background'
          : destaque
            ? 'text-primary hover:bg-primary hover:text-primary-foreground'
            : 'text-foreground/80 hover:bg-foreground hover:text-background')
      }
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}
