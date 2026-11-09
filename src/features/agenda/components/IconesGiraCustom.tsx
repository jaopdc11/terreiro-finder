/**
 * Ícones SVG custom pra giras quando lucide-react não tem equivalente.
 * Estilo lucide: viewBox 24×24, stroke currentColor, fill none, linecap round.
 * Mesma API que LucideIcon (size, strokeWidth, className, aria-hidden).
 */

interface IconeProps {
  size?: number | string;
  strokeWidth?: number | string;
  className?: string;
  'aria-hidden'?: boolean;
}

function baseProps({ size = 24, strokeWidth = 2 }: IconeProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

/** Tridente — Esquerda / Exus. */
export function Tridente(props: IconeProps) {
  return (
    <svg {...baseProps(props)} className={props.className} aria-hidden="true">
      {/* Pontas em V invertido, central mais alta */}
      <path d="M11 9 L 12 2 L 13 9" />
      <path d="M6 9 L 7 4 L 8 9" />
      <path d="M16 9 L 17 4 L 18 9" />
      {/* Junção base */}
      <path d="M6 9 L 18 9" />
      {/* Cabo */}
      <path d="M12 9 L 12 20" />
      {/* Pomo */}
      <circle cx="12" cy="21.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Arco e flecha — Oxóssi. */
export function ArcoFlecha(props: IconeProps) {
  return (
    <svg {...baseProps(props)} className={props.className} aria-hidden="true">
      {/* Arco curvo */}
      <path d="M6 3 C 3 8, 3 16, 6 21" />
      {/* Corda */}
      <path d="M6 3 L 6 21" strokeDasharray="2 2" />
      {/* Flecha — haste */}
      <path d="M6 12 L 21 12" />
      {/* Ponta */}
      <path d="M18 9 L 21 12 L 18 15" />
    </svg>
  );
}

/** Cabeça de cavalo (peão de xadrez) — Boiadeiros. */
export function Cavalo(props: IconeProps) {
  return (
    <svg {...baseProps(props)} className={props.className} aria-hidden="true">
      {/* Base */}
      <path d="M4 21 H 20" />
      {/* Silhueta cabeça/pescoço */}
      <path d="M6 21 V 17 C 6 14, 7 12, 9 11 L 8 8 L 11 6 L 14 3 L 17 6 C 19 8, 19 12, 19 15 L 19 21" />
      {/* Olho */}
      <circle cx="13" cy="10" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Espelho oval com cabo — Oxum. */
export function Espelho(props: IconeProps) {
  return (
    <svg {...baseProps(props)} className={props.className} aria-hidden="true">
      <ellipse cx="12" cy="9" rx="6" ry="6.5" />
      <path d="M12 15.5 L 12 22" />
      <path d="M9 22 L 15 22" />
    </svg>
  );
}

/** Xaxará — feixe de palhas amarrado, atributo de Omolu/Obaluaê. */
export function Xaxara(props: IconeProps) {
  return (
    <svg {...baseProps(props)} className={props.className} aria-hidden="true">
      {/* Palhas — raios saindo do topo */}
      <path d="M12 12 L 7 3" />
      <path d="M12 12 L 10 2" />
      <path d="M12 12 L 12 2" />
      <path d="M12 12 L 14 2" />
      <path d="M12 12 L 17 3" />
      {/* Amarração — duas linhas paralelas no meio */}
      <path d="M9 12 L 15 12" />
      <path d="M9 14 L 15 14" />
      {/* Cabo */}
      <path d="M12 14 L 12 22" />
    </svg>
  );
}
