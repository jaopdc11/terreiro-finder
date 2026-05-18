interface Props {
  size?: number;
  className?: string;
}

/**
 * Marca gráfica: ponto pemba com anel. Discreta — combina com tipografia
 * minúscula do logo "terreiros". Inspirado nas marcações de pemba (giz)
 * sem cair em iconografia religiosa explícita.
 */
export function Marca({ size = 20, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="10"
        cy="10"
        r="9"
        fill="none"
        stroke="hsl(var(--foreground))"
        strokeOpacity="0.18"
        strokeWidth="1"
      />
      <circle cx="10" cy="10" r="4" fill="hsl(var(--terra-pemba))" />
    </svg>
  );
}
