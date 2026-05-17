import { Link } from 'react-router-dom';

interface Secao {
  num: string;
  titulo: string;
  conteudo: React.ReactNode;
}

const SECOES: Secao[] = [
  {
    num: '01',
    titulo: 'O que o site faz',
    conteudo: (
      <p>
        O <strong className="text-foreground">terreiros</strong> é um site
        gratuito que ajuda pessoas a encontrar casas de religiões de matriz
        afro e afro-indígena. A dor que tentamos resolver é{' '}
        <em className="italic text-foreground">descoberta</em>: você quer
        chegar numa casa séria, e a casa quer ser achada por quem busca de
        verdade.
      </p>
    ),
  },
  {
    num: '02',
    titulo: 'Princípios',
    conteudo: (
      <ol className="space-y-3">
        <li>
          <strong className="text-foreground">O site não define doutrina.</strong>{' '}
          Cada casa fala por si. A gente só organiza e ajuda a encontrar.
        </li>
        <li>
          <strong className="text-foreground">A casa controla o que aparece.</strong>{' '}
          Endereço, contato, fotos, regras de visita — tudo é editável pela
          dirigência. Você pode pedir arquivamento a qualquer hora.
        </li>
        <li>
          <strong className="text-foreground">Moderação humana.</strong> Toda
          casa passa por revisão antes de virar pública. Indicação de
          visitante não publica automaticamente — só depois que a dirigência
          confirma.
        </li>
        <li>
          <strong className="text-foreground">Privacidade.</strong> Religião
          é dado sensível. Não pedimos nada que não seja necessário pra busca
          funcionar.
        </li>
        <li>
          <strong className="text-foreground">
            Indicação só publica com consentimento.
          </strong>{' '}
          Se alguém indica uma casa pela qual você é dirigência sem te avisar,
          a gente contata pra confirmar antes de tornar a ficha pública.
        </li>
      </ol>
    ),
  },
  {
    num: '03',
    titulo: 'O que a gente coleta',
    conteudo: (
      <ul className="space-y-3">
        <li>
          <strong className="text-foreground">Quem visita o site (anônimo):</strong>{' '}
          nada. O site funciona sem cadastro. Não usamos cookies de
          rastreamento.
        </li>
        <li>
          <strong className="text-foreground">Quem se cadastra:</strong> email
          e senha (criptografada), nome de exibição, e — se for dirigente —
          quais casas você administra. Nada disso é compartilhado com
          terceiros.
        </li>
        <li>
          <strong className="text-foreground">Quem cadastra uma casa:</strong>{' '}
          os dados que você preenche no wizard. Campos públicos estão
          explicitados no formulário; o que você marca como{' '}
          <em className="italic">oculto</em> ou{' '}
          <em className="italic">sob contato</em> não aparece pra visitantes
          anônimos.
        </li>
        <li>
          <strong className="text-foreground">Quem favorita uma casa:</strong>{' '}
          a relação fica visível só pra você (regra de banco impede outros
          usuários de verem seus favoritos).
        </li>
      </ul>
    ),
  },
  {
    num: '04',
    titulo: 'Pra que a gente usa',
    conteudo: (
      <>
        <p>
          Os dados servem{' '}
          <strong className="text-foreground">exclusivamente</strong> pra:
        </p>
        <ul className="mt-3 space-y-1.5">
          <li>— Autenticar você no painel da dirigência;</li>
          <li>— Permitir que visitantes encontrem casas via busca e mapa;</li>
          <li>— Moderar cadastros e indicações (contato cruzado antes de aprovar);</li>
          <li>— Contatar a dirigência caso uma indicação envolva a casa dela.</li>
        </ul>
        <p className="mt-4">
          A gente <strong className="text-foreground">não</strong> vende dado,{' '}
          <strong className="text-foreground">não</strong> compartilha com
          terceiros pra marketing, e{' '}
          <strong className="text-foreground">não</strong> faz perfil
          comportamental.
        </p>
      </>
    ),
  },
  {
    num: '05',
    titulo: 'Correção e remoção',
    conteudo: (
      <>
        <p>Se você é dirigência:</p>
        <ul className="mt-3 space-y-2">
          <li>
            <strong className="text-foreground">Edição:</strong> faça login e
            abra o{' '}
            <Link to="/painel" className="link-underline text-primary">
              painel
            </Link>
            . Pode mudar perfil, endereço, abertura, contato e fotos a
            qualquer hora.
          </li>
          <li>
            <strong className="text-foreground">Reivindicação:</strong> se sua
            casa apareceu via indicação e você quer assumir a ficha, abra{' '}
            <Link to="/" className="link-underline text-primary">
              a busca
            </Link>{' '}
            e clique em <em className="italic">Reivindique aqui</em>.
          </li>
          <li>
            <strong className="text-foreground">Arquivamento:</strong> nos
            contate. A gente arquiva a ficha em até 7 dias.
          </li>
        </ul>
        <p className="mt-4">
          Se você é só visitante e quer deletar a conta, nos escreva — apagamos
          a conta e os favoritos (sem afetar fichas de casas que você indicou:
          essas seguem moderadas pela dirigência).
        </p>
      </>
    ),
  },
  {
    num: '06',
    titulo: 'Contato',
    conteudo: (
      <p>
        Pra correção, remoção ou dúvidas:{' '}
        <a
          href="mailto:contato@terreiros.app"
          className="link-underline text-primary"
        >
          contato@terreiros.app
        </a>
        .
      </p>
    ),
  },
];

/**
 * Política de privacidade em layout editorial: cada seção tem número grande
 * à esquerda + título display + conteúdo em texto-corpo. Sem cards.
 */
export function Politica() {
  return (
    <article className="container max-w-4xl py-16">
      <header className="border-b border-foreground pb-10">
        <p className="eyebrow text-primary">Privacidade</p>
        <h1 className="display-hero mt-8 text-foreground">
          Política de <em>privacidade</em>.
        </h1>
        <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">
          Última atualização · 17 de maio de 2026
        </p>
      </header>

      <div>
        {SECOES.map((s) => (
          <section
            key={s.num}
            className="grid grid-cols-12 gap-x-6 border-b border-foreground/10 py-12"
          >
            <div className="col-span-12 md:col-span-3">
              <span className="font-mono text-sm text-primary">{s.num}</span>
              <h2 className="mt-3 font-display text-3xl leading-tight">
                {s.titulo}
              </h2>
            </div>
            <div className="col-span-12 mt-6 text-foreground/85 md:col-span-9 md:mt-0">
              {s.conteudo}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
