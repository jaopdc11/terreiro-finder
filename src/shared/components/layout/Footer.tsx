import { Link } from 'react-router-dom';

/**
 * Footer minimalista geométrico: grid de 12 colunas com linhas verticais
 * marcando divisões. Tipografia compacta uppercase. Sem ornamento colorido.
 */
export function Footer() {
  return (
    <footer className="mt-24 border-t border-foreground">
      <div className="container grid grid-cols-12 gap-x-6 py-12 text-sm">
        <div className="col-span-12 md:col-span-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
            terreiros<span className="text-primary">.</span>
          </p>
          <p className="mt-6 max-w-md text-foreground/80">
            Site gratuito de busca de casas de matriz afro e afro-indígena.
            Cada casa fala por si; a gente só ajuda na descoberta.
          </p>
        </div>

        <nav
          aria-label="Rodapé"
          className="col-span-6 mt-8 flex flex-col gap-3 md:col-span-3 md:mt-0 md:border-l md:border-foreground/10 md:pl-6"
        >
          <p className="eyebrow">Navegação</p>
          <Link to="/" className="link-underline text-foreground">
            Buscar
          </Link>
          <Link to="/sobre" className="link-underline text-foreground">
            Sobre o projeto
          </Link>
          <Link to="/indicar" className="link-underline text-foreground">
            Indicar uma casa
          </Link>
        </nav>

        <nav
          aria-label="Legal"
          className="col-span-6 mt-8 flex flex-col gap-3 md:col-span-3 md:mt-0 md:border-l md:border-foreground/10 md:pl-6"
        >
          <p className="eyebrow">Legal</p>
          <Link to="/politica" className="link-underline text-foreground">
            Política de privacidade
          </Link>
        </nav>
      </div>

      <div className="border-t border-foreground/10">
        <div className="container flex flex-wrap items-center justify-between gap-4 py-4 text-xs text-muted-foreground">
          <p className="uppercase tracking-wider">Feito com axé · Sem fins lucrativos</p>
          <p className="uppercase tracking-wider">{new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
}
