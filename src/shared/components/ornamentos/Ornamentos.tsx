/**
 * Ornamentos gráficos próprios — formas geométricas abstratas inspiradas
 * em pemba (giz ritual), encruzilhadas e cordões, sem figurar pessoas,
 * orixás ou símbolos religiosos específicos. Servem como decoração de
 * fundo e separadores editoriais.
 */

interface OrnamentoProps {
  className?: string;
  /** Cor primária. Aceita qualquer valor CSS (HSL var, hex). */
  color?: string;
  /** Cor secundária (acento). */
  accent?: string;
}

const DEFAULT_FG = 'hsl(var(--foreground))';
const DEFAULT_PEMBA = 'hsl(var(--terra-pemba))';

/**
 * Riscos paralelos com variação de comprimento, evocando marcações de
 * pemba no chão. Uso: ornamento horizontal sob títulos.
 */
export function Riscos({ className, color = DEFAULT_FG, accent = DEFAULT_PEMBA }: OrnamentoProps) {
  return (
    <svg
      viewBox="0 0 200 24"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <line x1="0" y1="6" x2="40" y2="6" stroke={color} strokeWidth="1.5" />
      <line x1="48" y1="6" x2="68" y2="6" stroke={color} strokeWidth="1.5" />
      <line x1="76" y1="6" x2="124" y2="6" stroke={accent} strokeWidth="2" />
      <line x1="132" y1="6" x2="160" y2="6" stroke={color} strokeWidth="1.5" />
      <line x1="168" y1="6" x2="200" y2="6" stroke={color} strokeWidth="1.5" />
      <circle cx="124" cy="18" r="2.5" fill={accent} />
    </svg>
  );
}

/**
 * Trama: linhas se cruzando em ângulo, formando estrutura tipo esteira
 * ou cordão de iniciação. Decorativa, abstrata.
 */
export function Trama({ className, color = DEFAULT_FG }: OrnamentoProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <g fill="none" stroke={color} strokeOpacity="0.18" strokeWidth="1">
        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={i * 16 + 4}
            x2="120"
            y2={i * 16 + 4}
          />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={i * 16 + 4}
            y1="0"
            x2={i * 16 + 4}
            y2="120"
          />
        ))}
      </g>
    </svg>
  );
}

/**
 * Encruzilhada abstrata: quatro linhas convergindo num ponto pemba.
 * Símbolo de encontro/cruzamento de caminhos — não religioso específico.
 */
export function Encontro({ className, color = DEFAULT_FG, accent = DEFAULT_PEMBA }: OrnamentoProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g stroke={color} strokeWidth="1.5" strokeLinecap="round">
        <line x1="50" y1="10" x2="50" y2="40" />
        <line x1="50" y1="60" x2="50" y2="90" />
        <line x1="10" y1="50" x2="40" y2="50" />
        <line x1="60" y1="50" x2="90" y2="50" />
      </g>
      <circle cx="50" cy="50" r="6" fill={accent} />
    </svg>
  );
}

/**
 * Pontos em grade rítmica — usado como pattern de fundo. Variação de
 * tamanho cria movimento sutil sem virar textura agressiva.
 */
export function PontosGrade({ className, color = DEFAULT_FG }: OrnamentoProps) {
  const linhas = 6;
  const colunas = 12;
  return (
    <svg
      viewBox={`0 0 ${colunas * 16} ${linhas * 16}`}
      className={className}
      aria-hidden="true"
    >
      {Array.from({ length: linhas }).flatMap((_, l) =>
        Array.from({ length: colunas }).map((__, c) => {
          const isAccent = (l + c) % 7 === 3;
          return (
            <circle
              key={`${l}-${c}`}
              cx={c * 16 + 8}
              cy={l * 16 + 8}
              r={isAccent ? 2 : 1}
              fill={color}
              fillOpacity={isAccent ? 0.5 : 0.25}
            />
          );
        }),
      )}
    </svg>
  );
}

/**
 * Linha vertical com nó pemba no meio — ornamento de canto pra hero.
 */
export function FioComNo({
  className,
  color = DEFAULT_FG,
  accent = DEFAULT_PEMBA,
}: OrnamentoProps) {
  return (
    <svg
      viewBox="0 0 24 200"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <line
        x1="12"
        y1="0"
        x2="12"
        y2="92"
        stroke={color}
        strokeWidth="1.5"
        strokeOpacity="0.5"
      />
      <circle cx="12" cy="100" r="5" fill={accent} />
      <line
        x1="12"
        y1="108"
        x2="12"
        y2="200"
        stroke={color}
        strokeWidth="1.5"
        strokeOpacity="0.5"
      />
    </svg>
  );
}

/**
 * Arco simples — meio círculo. Usado como ornamento de canto/abertura
 * de seção.
 */
export function Arco({
  className,
  color = DEFAULT_FG,
  accent = DEFAULT_PEMBA,
}: OrnamentoProps) {
  return (
    <svg viewBox="0 0 200 100" className={className} aria-hidden="true">
      <path
        d="M 10 90 A 90 90 0 0 1 190 90"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeOpacity="0.4"
      />
      <path
        d="M 50 90 A 50 50 0 0 1 150 90"
        fill="none"
        stroke={accent}
        strokeWidth="1.5"
      />
      <circle cx="100" cy="40" r="3" fill={accent} />
    </svg>
  );
}
