import { Link } from 'react-router-dom';

const PRINCIPIOS: { num: string; titulo: string; desc: string }[] = [
  {
    num: '01',
    titulo: 'Site não define doutrina',
    desc: 'Cada casa fala por si mesma. A gente só organiza e ajuda a encontrar.',
  },
  {
    num: '02',
    titulo: 'Casa controla exposição',
    desc: 'Edite, oculte ou arquive a qualquer hora. Endereço só aparece se a casa autorizar.',
  },
  {
    num: '03',
    titulo: 'Moderação humana',
    desc: 'Indicação não publica direto — admin contata a dirigência antes de aprovar.',
  },
  {
    num: '04',
    titulo: 'Privacidade',
    desc: 'Religião é dado sensível. Nada compartilhado, nada vendido.',
  },
];

const PASSOS: { num: string; titulo: string; desc: string }[] = [
  {
    num: '01',
    titulo: 'Você busca.',
    desc: 'Mapa de Itajaí com pins das casas. Filtra por tradição, abertura, nação. Vê a ficha, conhece a dirigência, combina a visita.',
  },
  {
    num: '02',
    titulo: 'Indica uma casa que você conhece.',
    desc: 'A indicação passa por contato cruzado: a gente fala com a casa antes de publicar.',
  },
  {
    num: '03',
    titulo: 'Cadastra a tua, se for dirigência.',
    desc: 'Wizard guiado em 3 passos. Você decide o que aparece publicamente.',
  },
];

export function Home() {
  return (
    <article className="container max-w-6xl py-16">
      {/* Hero editorial */}
      <header className="border-b border-foreground pb-16">
        <p className="eyebrow text-primary">Sobre o projeto</p>
        <h1 className="display-hero mt-8 text-foreground">
          Um lugar pra <em>encontrar</em> casas — e ser encontrado.
        </h1>
        <div className="mt-10 grid grid-cols-12 gap-x-6">
          <p className="col-span-12 text-lg leading-relaxed text-foreground/80 md:col-span-7">
            <strong className="text-foreground">terreiros</strong> é um site
            gratuito de busca de casas de matriz afro e afro-indígena. A dor
            que tentamos resolver é <em className="italic">descoberta</em>:
            quem busca, encontra; quem é da casa, aparece.
          </p>
          <div className="col-span-12 mt-6 flex flex-wrap gap-3 md:col-span-5 md:mt-0 md:justify-end">
            <Link
              to="/"
              className="inline-flex h-12 items-center bg-foreground px-6 text-xs font-semibold uppercase tracking-widest text-background hover:bg-primary"
            >
              Buscar uma casa
            </Link>
            <Link
              to="/indicar"
              className="inline-flex h-12 items-center border border-foreground px-6 text-xs font-semibold uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background"
            >
              Indicar
            </Link>
          </div>
        </div>
      </header>

      {/* Como funciona */}
      <section className="py-20">
        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 md:col-span-4">
            <p className="eyebrow text-muted-foreground">Como funciona</p>
            <h2 className="mt-4 font-display text-4xl leading-tight">
              Três caminhos.<br />Uma porta.
            </h2>
          </div>
          <ol className="col-span-12 mt-8 md:col-span-8 md:mt-0">
            {PASSOS.map((p) => (
              <li
                key={p.num}
                className="grid grid-cols-12 gap-4 border-t border-foreground py-8 first:border-t-0"
              >
                <span className="col-span-12 font-mono text-sm text-primary sm:col-span-2">
                  {p.num}
                </span>
                <div className="col-span-12 sm:col-span-10">
                  <h3 className="font-display text-2xl">{p.titulo}</h3>
                  <p className="mt-3 text-foreground/80">{p.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Princípios em grid 2x2 */}
      <section className="border-t border-foreground py-20">
        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 md:col-span-4">
            <p className="eyebrow text-muted-foreground">Princípios</p>
            <h2 className="mt-4 font-display text-4xl leading-tight">
              Inegociáveis.
            </h2>
          </div>
          <ul className="col-span-12 mt-8 grid grid-cols-1 gap-px bg-foreground/10 md:col-span-8 md:mt-0 md:grid-cols-2">
            {PRINCIPIOS.map((p) => (
              <li key={p.num} className="bg-background p-6">
                <span className="font-mono text-xs text-primary">{p.num}</span>
                <p className="mt-3 font-display text-xl">{p.titulo}</p>
                <p className="mt-2 text-sm text-foreground/75">{p.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA final em faixa */}
      <section className="-mx-4 border-y border-foreground bg-foreground px-4 py-16 text-background sm:-mx-6 sm:px-6">
        <div className="container max-w-6xl">
          <div className="grid grid-cols-12 gap-x-6">
            <div className="col-span-12 md:col-span-7">
              <p className="eyebrow text-primary">Participe</p>
              <h2 className="mt-4 font-display text-4xl leading-tight">
                Quer ajudar a comunidade a crescer?
              </h2>
              <p className="mt-3 text-background/75">
                A descoberta começa pelo cadastro. Se você é da dirigência ou
                conhece uma casa que merece estar aqui:
              </p>
            </div>
            <div className="col-span-12 mt-8 flex flex-wrap gap-3 md:col-span-5 md:mt-0 md:justify-end md:self-end">
              <Link
                to="/indicar"
                className="inline-flex h-12 items-center border border-background bg-background px-6 text-xs font-semibold uppercase tracking-widest text-foreground hover:bg-primary hover:text-primary-foreground"
              >
                Indicar uma casa
              </Link>
              <Link
                to="/cadastrar"
                className="inline-flex h-12 items-center border border-background px-6 text-xs font-semibold uppercase tracking-widest text-background hover:bg-background hover:text-foreground"
              >
                Cadastrar minha casa
              </Link>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
