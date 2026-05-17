import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border/60 bg-card/40">
      <div className="ornament-rule" aria-hidden="true" />
      <div className="container space-y-4 py-8 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            <p className="flex items-center gap-2 font-display text-base text-foreground">
              <span
                aria-hidden="true"
                className="inline-block h-2 w-2 rounded-full bg-primary"
              />
              terreiros
            </p>
            <p className="max-w-md">
              Site gratuito de busca de casas de matriz afro e afro-indígena.
              Cada casa fala por si; a gente só ajuda na descoberta.
            </p>
          </div>
          <nav aria-label="Rodapé" className="flex flex-col gap-2 sm:items-end">
            <Link to="/sobre" className="hover:text-foreground">
              Sobre o projeto
            </Link>
            <Link to="/politica" className="hover:text-foreground">
              Política de privacidade
            </Link>
            <Link to="/indicar" className="hover:text-foreground">
              Indicar uma casa
            </Link>
          </nav>
        </div>
        <p className="border-t border-border/40 pt-4 text-xs text-muted-foreground/70">
          Feito com axé. Sem fins lucrativos.
        </p>
      </div>
    </footer>
  );
}
