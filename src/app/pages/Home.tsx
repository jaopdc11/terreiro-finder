export function Home() {
  return (
    <section className="container py-16">
      <h1 className="font-display text-4xl text-foreground md:text-5xl">
        Encontre uma casa pra chamar de sua.
      </h1>
      <p className="mt-4 max-w-prose text-lg text-muted-foreground">
        Esse é um placeholder do projeto <strong>terreiros</strong> — site gratuito de busca
        de casas de matriz afro e afro-indígena. A busca, o mapa e a ficha de cada casa
        chegam nas próximas fases.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="/indicar"
          className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
        >
          Indicar uma casa
        </a>
        <a
          href="/cadastrar"
          className="rounded-lg border border-primary px-4 py-2 text-primary hover:bg-primary/10"
        >
          Cadastrar minha casa
        </a>
      </div>
    </section>
  );
}
