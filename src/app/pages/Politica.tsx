import { Link } from 'react-router-dom';

/**
 * Política de privacidade — versão simples do MVP. Pode evoluir depois,
 * mas o gate da Fase 5 exige só: dizer o que coletamos, por quê, e como
 * contatar pra correção/remoção. Inspirado no princípio §1.2 #4 (casa
 * controla exposição).
 */
export function Politica() {
  return (
    <article className="container max-w-3xl space-y-8 py-12 text-foreground/90">
      <header className="space-y-3 border-b border-border/60 pb-6">
        <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">
          <span aria-hidden="true" className="h-1 w-6 rounded-full bg-primary" />
          Privacidade
        </p>
        <h1 className="font-display text-4xl sm:text-5xl">
          Política de privacidade
        </h1>
        <p className="text-sm text-muted-foreground">
          Última atualização: 17 de maio de 2026
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">O que o site faz</h2>
        <p>
          O <strong>terreiros</strong> é um site gratuito que ajuda pessoas a
          encontrar casas de religiões de matriz afro e afro-indígena. A dor que
          tentamos resolver é <em>descoberta</em>: você quer chegar numa casa
          séria, e a casa quer ser achada por quem busca de verdade.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Princípios</h2>
        <ol className="list-decimal space-y-2 pl-6">
          <li>
            <strong>O site não define doutrina.</strong> Cada casa fala por si
            mesma. A gente só organiza e ajuda a encontrar.
          </li>
          <li>
            <strong>A casa controla o que aparece.</strong> Endereço, contato,
            fotos, regras de visita — tudo é editável pela dirigência. Você
            pode pedir arquivamento a qualquer momento.
          </li>
          <li>
            <strong>Moderação humana.</strong> Toda casa passa por revisão antes
            de virar pública. Indicação de visitante não publica
            automaticamente — só depois que a dirigência confirma.
          </li>
          <li>
            <strong>Privacidade.</strong> Religião é dado sensível. Não pedimos
            nenhuma informação que não seja estritamente necessária pra busca
            funcionar.
          </li>
          <li>
            <strong>Indicação só publica com consentimento.</strong> Se alguém
            indica uma casa pela qual você é dirigente sem te avisar antes, a
            gente entra em contato pra confirmar antes de tornar a ficha
            pública.
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">O que a gente coleta</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Quem visita o site (anônimo):</strong> nada. O site funciona
            sem cadastro. Não usamos cookies de rastreamento.
          </li>
          <li>
            <strong>Quem se cadastra:</strong> email e senha (criptografada),
            nome de exibição, e — se for dirigente — quais casas você
            administra. Nada disso é compartilhado com terceiros.
          </li>
          <li>
            <strong>Quem cadastra uma casa:</strong> os dados que você mesmo
            preenche no wizard (nome da casa, endereço, contatos, perfil de
            abertura). Os campos que aparecem publicamente estão explicitados
            no formulário; o que você marca como <em>oculto</em> ou{' '}
            <em>sob contato</em> não aparece pra visitantes anônimos.
          </li>
          <li>
            <strong>Quem favorita uma casa:</strong> a relação fica visível
            <em> só pra você</em> (regra de banco impede outros usuários de
            verem seus favoritos).
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Pra que a gente usa</h2>
        <p>
          Os dados servem <strong>exclusivamente</strong> pra:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>autenticar você no painel da dirigência;</li>
          <li>permitir que visitantes encontrem casas via busca e mapa;</li>
          <li>moderar cadastros e indicações (contato cruzado antes de aprovar);</li>
          <li>contatar a dirigência caso uma indicação envolva a casa dela.</li>
        </ul>
        <p>
          A gente <strong>não</strong> vende dado, <strong>não</strong>{' '}
          compartilha com terceiros pra marketing, e <strong>não</strong> faz
          perfil comportamental.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Como pedir correção ou remoção</h2>
        <p>
          Se você é dirigência:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            Edição: faça login e abra o <Link to="/painel" className="text-primary hover:underline">painel</Link>.
            Você pode mudar perfil, endereço, abertura, contato e fotos a
            qualquer momento.
          </li>
          <li>
            Reivindicação: se sua casa apareceu via indicação e você quer
            assumir a ficha, abra <Link to="/" className="text-primary hover:underline">a busca</Link>,
            entre na ficha da casa e clique em <em>Reivindique aqui</em>.
          </li>
          <li>
            Arquivamento (tirar do ar): nos contate (veja abaixo). A gente
            arquiva a ficha em até 7 dias.
          </li>
        </ul>
        <p>
          Se você só é visitante e quer deletar sua conta, nos escreva — a
          gente apaga sua conta e seus favoritos (sem afetar fichas de casas
          que você indicou: essas seguem moderadas pela dirigência).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Contato</h2>
        <p>
          Para correção, remoção ou dúvidas:{' '}
          <a
            href="mailto:contato@terreiros.app"
            className="text-primary hover:underline"
          >
            contato@terreiros.app
          </a>
          .
        </p>
      </section>
    </article>
  );
}
