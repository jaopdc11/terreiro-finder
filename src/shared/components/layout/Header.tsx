import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { useServices } from '@/shared/hooks/useServices';
import { useMinhasCasas } from '@/features/painel/hooks/usePainel';

export function Header() {
  const { sessao, auth } = useServices();
  const estado = sessao.use((s) => s);
  const navigate = useNavigate();
  // Só renderiza o link "Cadastrar minha casa" quando o user logado ainda não
  // tem nenhuma casa vinculada — evita ruído pra quem já é dirigente.
  const { data: minhasCasas } = useMinhasCasas();
  const mostrarCadastrar = !!estado.sessao && (minhasCasas?.length ?? 0) === 0;

  const sair = () => {
    sessao.sair();
    void auth.logout().catch(() => {});
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex items-center justify-between gap-4 py-4">
        <Link
          to="/"
          className="group flex items-center gap-2 font-display text-2xl font-medium text-primary"
          aria-label="terreiros — voltar pra busca"
        >
          <span
            aria-hidden="true"
            className="inline-block h-3 w-3 rounded-full bg-primary shadow-warm-sm transition-transform group-hover:scale-110"
          />
          <span className="leading-none">terreiros</span>
        </Link>

        <nav
          aria-label="Principal"
          className="hidden items-center gap-1 text-sm md:flex"
        >
          <NavLink to="/">Buscar</NavLink>
          <NavLink to="/indicar">Indicar uma casa</NavLink>
          {mostrarCadastrar ? (
            <NavLink to="/cadastrar" destaque>
              Cadastrar minha casa
            </NavLink>
          ) : null}
          {estado.sessao ? <NavLink to="/painel">Meu painel</NavLink> : null}
          {estado.sessao?.podeAdministrar() ? (
            <NavLink to="/admin">Moderação</NavLink>
          ) : null}
          <NavLink to="/sobre">Sobre</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {estado.carregando ? null : estado.sessao ? (
            <>
              <span className="hidden text-sm text-muted-foreground md:inline">
                Salve, <span className="text-foreground">{estado.sessao.nomeExibicao}</span>
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
                <Button size="sm">Criar conta</Button>
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
  children,
  destaque,
}: {
  to: string;
  children: React.ReactNode;
  destaque?: boolean;
}) {
  return (
    <Link
      to={to}
      className={
        'rounded-md px-3 py-1.5 transition-colors ' +
        (destaque
          ? 'font-medium text-primary hover:bg-primary/5'
          : 'text-foreground/80 hover:bg-terra-areia-claro/50 hover:text-foreground')
      }
    >
      {children}
    </Link>
  );
}
