import { Link } from 'react-router-dom';

/**
 * Página `/sobre` — explica o projeto, os princípios e como participar.
 * Não tem dependência de dados; serve como porta de entrada institucional.
 */
export function Home() {
  return (
    <article className="container max-w-3xl space-y-10 py-12">
      <header className="space-y-4 border-b border-border/60 pb-8">
        <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">
          <span aria-hidden="true" className="h-1 w-6 rounded-full bg-primary" />
          Sobre o projeto
        </p>
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">
          Um lugar pra encontrar casas — e ser encontrado.
        </h1>
        <p className="max-w-prose text-lg text-foreground/80">
          O <strong>terreiros</strong> é um site gratuito de busca de casas de
          matriz afro e afro-indígena. A dor que tentamos resolver é{' '}
          <em>descoberta</em>: quem busca, encontra; quem é da casa, aparece.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Como funciona</h2>
        <ol className="space-y-3 text-foreground/85">
          <li className="card-surface p-5">
            <p className="font-medium text-foreground">1. Você busca.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Mapa de Itajaí com pins das casas cadastradas. Filtra por
              tradição, abertura a visitas, nação (Candomblé), reinos
              (Umbanda). Vê a ficha, conhece a dirigência, combina a visita.
            </p>
          </li>
          <li className="card-surface p-5">
            <p className="font-medium text-foreground">
              2. Indica uma casa que você conhece.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Indicação não publica direto — o admin entra em contato com a
              casa antes de aprovar. Princípio: casa decide o que aparece.
            </p>
          </li>
          <li className="card-surface p-5">
            <p className="font-medium text-foreground">
              3. Cadastra a tua casa, se for dirigência.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Cadastro guiado em 3 passos. Você controla endereço, contatos,
              fotos e quais informações aparecem publicamente.
            </p>
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Princípios</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {[
            ['Site não define doutrina', 'Cada casa fala por si mesma.'],
            ['Casa controla exposição', 'Edite, oculte ou arquive a qualquer hora.'],
            ['Moderação humana', 'Indicação não publica sem consentimento.'],
            ['Privacidade', 'Religião é dado sensível. Nada compartilhado.'],
          ].map(([titulo, desc]) => (
            <li key={titulo} className="card-surface p-5">
              <p className="font-medium text-foreground">{titulo}</p>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="card-surface p-7 sm:p-8">
        <h2 className="font-display text-2xl">Quer ajudar a crescer?</h2>
        <p className="mt-2 text-sm text-foreground/80">
          A descoberta começa pelo cadastro. Se você é da dirigência ou conhece
          uma casa que merece estar aqui:
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/indicar"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-warm-sm transition-all hover:bg-terra-pemba-escuro hover:shadow-warm"
          >
            Indicar uma casa
          </Link>
          <Link
            to="/cadastrar"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-primary/70 bg-card/40 px-6 text-sm font-medium text-primary shadow-warm-sm transition-all hover:border-primary hover:bg-primary/5"
          >
            Cadastrar minha casa
          </Link>
        </div>
      </section>
    </article>
  );
}
