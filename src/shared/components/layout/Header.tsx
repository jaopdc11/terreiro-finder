import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { useServices } from '@/shared/hooks/useServices';

export function Header() {
  const { sessao, auth } = useServices();
  const estado = sessao.use((s) => s);
  const navigate = useNavigate();

  /**
   * Zera o estado local IMEDIATAMENTE pra UI responder. O logout no
   * supabase-js roda em background — se falhar, o estado local já foi
   * limpo, então o usuário só precisa relogar.
   */
  const sair = () => {
    sessao.sair();
    void auth.logout().catch(() => {});
    navigate('/');
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="container flex items-center justify-between gap-4 py-4">
        <Link to="/" className="font-display text-2xl font-semibold text-primary">
          terreiros
        </Link>

        <nav aria-label="Principal" className="hidden gap-6 text-sm md:flex">
          <Link to="/" className="hover:text-primary">
            Buscar
          </Link>
          <Link to="/indicar" className="hover:text-primary">
            Indicar uma casa
          </Link>
          {estado.sessao ? (
            <Link to="/painel" className="hover:text-primary">
              Meu painel
            </Link>
          ) : null}
          {estado.sessao?.podeAdministrar() ? (
            <Link to="/admin" className="hover:text-primary">
              Moderação
            </Link>
          ) : null}
          <Link to="/sobre" className="hover:text-primary">
            Sobre
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {estado.carregando ? null : estado.sessao ? (
            <>
              <span className="hidden text-sm text-muted-foreground md:inline">
                Salve, {estado.sessao.nomeExibicao}
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
