import { Link } from 'react-router-dom';
import { Marca } from '@/shared/components/Marca';

/**
 * Footer estilo Linear/Vercel: claro, grid simples de links, copy discreta.
 * Sem ornamento dramático.
 */
export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-card/40">
      <div className="container grid grid-cols-12 gap-x-8 gap-y-10 py-12">
        <div className="col-span-12 md:col-span-5">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-foreground"
            aria-label="Encruza"
          >
            <Marca size={24} />
            <span className="text-base font-semibold tracking-tight">
              Encruza
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Site gratuito de busca de casas de matriz afro e afro-indígena.
            Cada casa fala por si; ajudamos na descoberta.
          </p>
        </div>

        <nav
          aria-label="Navegação"
          className="col-span-6 md:col-span-2 md:col-start-7"
        >
          <p className="mb-3 text-xs font-semibold text-foreground">Site</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/mapa" className="text-muted-foreground hover:text-foreground">Mapa</Link></li>
            <li><Link to="/sobre" className="text-muted-foreground hover:text-foreground">Sobre</Link></li>
            <li><Link to="/indicar" className="text-muted-foreground hover:text-foreground">Indicar</Link></li>
            <li><Link to="/cadastrar" className="text-muted-foreground hover:text-foreground">Cadastrar casa</Link></li>
          </ul>
        </nav>

        <nav aria-label="Legal" className="col-span-6 md:col-span-2">
          <p className="mb-3 text-xs font-semibold text-foreground">Legal</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/politica" className="text-muted-foreground hover:text-foreground">
                Política de privacidade
              </Link>
            </li>
            <li>
              <a
                href="mailto:contato@encruza.app"
                className="text-muted-foreground hover:text-foreground"
              >
                contato@encruza.app
              </a>
            </li>
          </ul>
        </nav>

        <div className="col-span-12 md:col-span-2">
          <p className="mb-3 text-xs font-semibold text-foreground">Comunidade</p>
          <p className="text-sm text-muted-foreground">
            Itajaí (SC).<br />Feito com axé, sem fins lucrativos.
          </p>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Encruza</p>
          <p>Cada casa fala por si.</p>
        </div>
      </div>
    </footer>
  );
}
