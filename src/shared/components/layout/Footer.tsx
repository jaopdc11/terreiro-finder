import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/60">
      <div className="container flex flex-wrap items-center justify-between gap-3 py-6 text-sm text-muted-foreground">
        <p>
          terreiros — site gratuito de busca de casas de matriz afro e
          afro-indígena.
        </p>
        <nav aria-label="Rodapé" className="flex gap-4">
          <Link to="/sobre" className="hover:text-foreground">
            Sobre
          </Link>
          <Link to="/politica" className="hover:text-foreground">
            Política de privacidade
          </Link>
        </nav>
      </div>
    </footer>
  );
}
