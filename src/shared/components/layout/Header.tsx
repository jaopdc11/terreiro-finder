import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useServices } from '@/shared/hooks/useServices';
import { Button } from '@/shared/ui/button';
import { Marca } from '@/shared/components/Marca';

/**
 * Header estilo Linear/Vercel: fundo creme com leve transparência + blur,
 * border-b fino, tipografia normal (sem uppercase), espaçamento generoso.
 * Logo discreto com marca SVG (círculo pemba + anel).
 */
export function Header() {
  const { sessao, auth } = useServices();
  const estado = sessao.use((s) => s);
  const navigate = useNavigate();
  const location = useLocation();
  const mostrarCadastrar = !!estado.sessao;

  const sair = () => {
    sessao.sair();
    void auth.logout().catch(() => {});
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-14 items-center gap-8">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-foreground transition-colors hover:text-primary"
          aria-label="Encruza — voltar pra home"
        >
          <Marca size={24} />
          <span className="text-base font-semibold tracking-tight">
            Encruza
          </span>
        </Link>

        <nav
          aria-label="Principal"
          className="hidden items-center gap-1 text-sm md:flex"
        >
          <NavLink to="/mapa" active={location.pathname === '/mapa'}>
            Mapa
          </NavLink>
          <NavLink to="/indicar" active={location.pathname === '/indicar'}>
            Indicar
          </NavLink>
          {mostrarCadastrar ? (
            <NavLink to="/cadastrar" active={location.pathname === '/cadastrar'}>
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

        <div className="ml-auto flex items-center gap-2">
          {estado.carregando ? null : estado.sessao ? (
            <>
              <span className="hidden text-sm text-muted-foreground md:inline">
                Olá, {estado.sessao.nomeExibicao}
              </span>
              <Button variant="ghost" size="sm" onClick={sair}>
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link to="/cadastro">
                <Button variant="primary" size="sm">
                  Criar conta
                </Button>
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
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={
        'rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ' +
        (active
          ? 'text-foreground'
          : 'text-muted-foreground hover:text-foreground')
      }
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}
