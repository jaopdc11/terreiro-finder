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
        O <strong className="text-foreground">Encruza</strong> é um site
        gratuito que auxilia pessoas a encontrar casas de religiões de matriz
        afro e afro-indígena. A dor que buscamos endereçar é a{' '}
        <em>descoberta</em>: o visitante deseja chegar a uma casa séria, e a
        casa deseja ser encontrada por quem realmente busca.
      </p>
    ),
  },
  {
    num: '02',
    titulo: 'Princípios',
    conteudo: (
      <ol className="space-y-3">
        <li>
          <strong className="text-foreground">
            O site não define doutrina.
          </strong>{' '}
          Cada casa fala por si. Apenas organizamos e ajudamos a encontrar.
        </li>
        <li>
          <strong className="text-foreground">
            A casa controla o que aparece.
          </strong>{' '}
          Endereço, contato, fotos e regras de visita são editáveis pela
          dirigência. A casa pode solicitar arquivamento a qualquer momento.
        </li>
        <li>
          <strong className="text-foreground">Moderação humana.</strong> Toda
          casa passa por revisão antes de tornar-se pública. Indicações de
          visitantes não publicam automaticamente — apenas após confirmação
          da dirigência.
        </li>
        <li>
          <strong className="text-foreground">Privacidade.</strong> Religião
          é dado sensível. Não solicitamos nada que não seja estritamente
          necessário ao funcionamento da busca.
        </li>
        <li>
          <strong className="text-foreground">
            Indicação só publica com consentimento.
          </strong>{' '}
          Caso alguém indique uma casa sob sua dirigência sem aviso prévio,
          entraremos em contato para confirmar antes de publicar a ficha.
        </li>
      </ol>
    ),
  },
  {
    num: '03',
    titulo: 'O que coletamos',
    conteudo: (
      <ul className="space-y-3">
        <li>
          <strong className="text-foreground">
            Visitantes anônimos do site:
          </strong>{' '}
          nada. O site funciona sem cadastro. Não utilizamos cookies de
          rastreamento.
        </li>
        <li>
          <strong className="text-foreground">Pessoas cadastradas:</strong>{' '}
          email, senha (armazenada criptografada), nome de exibição e — para
          dirigentes — as casas que administram. Nenhuma dessas informações
          é compartilhada com terceiros.
        </li>
        <li>
          <strong className="text-foreground">
            Cadastro de casa pela dirigência:
          </strong>{' '}
          dados preenchidos pelo próprio dirigente no wizard. Os campos
          publicáveis são identificados no formulário; o que estiver marcado
          como <em>oculto</em> ou <em>sob contato</em> não aparece para
          visitantes anônimos.
        </li>
        <li>
          <strong className="text-foreground">Favoritos:</strong> a relação
          fica visível apenas para o próprio usuário (regra de banco impede
          outros usuários de visualizarem seus favoritos).
        </li>
      </ul>
    ),
  },
  {
    num: '04',
    titulo: 'Para que utilizamos',
    conteudo: (
      <>
        <p>Os dados servem <strong className="text-foreground">exclusivamente</strong> para:</p>
        <ul className="mt-3 space-y-1.5">
          <li>— Autenticar usuários no painel da dirigência;</li>
          <li>— Permitir que visitantes encontrem casas via busca e mapa;</li>
          <li>— Moderar cadastros e indicações (contato cruzado antes da aprovação);</li>
          <li>— Contatar a dirigência quando uma indicação envolve a casa.</li>
        </ul>
        <p className="mt-4">
          Não vendemos dados, não compartilhamos com terceiros para fins de
          marketing e não realizamos perfilamento comportamental.
        </p>
      </>
    ),
  },
  {
    num: '05',
    titulo: 'Correção e remoção',
    conteudo: (
      <>
        <p>Caso você seja dirigência:</p>
        <ul className="mt-3 space-y-2">
          <li>
            <strong className="text-foreground">Edição:</strong> faça login
            e abra o{' '}
            <Link to="/painel" className="link-underline text-primary">
              painel
            </Link>
            . É possível alterar perfil, endereço, abertura, contato e fotos
            a qualquer momento.
          </li>
          <li>
            <strong className="text-foreground">Reivindicação:</strong> se
            sua casa apareceu via indicação e você deseja assumir a ficha,
            abra{' '}
            <Link to="/mapa" className="link-underline text-primary">
              o mapa
            </Link>{' '}
            e clique em <em>Reivindique aqui</em>.
          </li>
          <li>
            <strong className="text-foreground">Arquivamento:</strong> entre
            em contato conosco. A ficha é arquivada em até 7 dias.
          </li>
        </ul>
        <p className="mt-4">
          Para visitantes que desejam excluir a conta, basta nos enviar uma
          solicitação por email — apagamos a conta e os favoritos (sem afetar
          fichas de casas indicadas, que continuam sob moderação da dirigência).
        </p>
      </>
    ),
  },
  {
    num: '06',
    titulo: 'Contato',
    conteudo: (
      <p>
        Para correções, remoções ou dúvidas:{' '}
        <a
          href="mailto:contato@encruza.app"
          className="link-underline text-primary"
        >
          contato@encruza.app
        </a>
        .
      </p>
    ),
  },
];

export function Politica() {
  return (
    <article className="container max-w-4xl py-12">
      <header className="border-b border-border pb-8">
        <p className="eyebrow eyebrow-ornado inline-flex items-center">Privacidade</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
          Política de privacidade
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Última atualização: 17 de maio de 2026
        </p>
      </header>

      <div>
        {SECOES.map((s) => (
          <section
            key={s.num}
            className="grid grid-cols-12 gap-x-6 border-b border-border py-10 last:border-b-0"
          >
            <div className="col-span-12 md:col-span-3">
              <span className="font-mono text-xs text-muted-foreground">
                {s.num}
              </span>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                {s.titulo}
              </h2>
            </div>
            <div className="col-span-12 mt-4 text-sm leading-relaxed text-foreground/85 md:col-span-9 md:mt-0">
              {s.conteudo}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
