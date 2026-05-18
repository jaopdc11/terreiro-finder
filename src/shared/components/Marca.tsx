interface Props {
  size?: number;
  className?: string;
}

/**
 * Marca gráfica do "Encruza": tridente 🔱. Usa o emoji Unicode renderizado
 * pela fonte de emoji do SO — fica idêntico ao WhatsApp em cada plataforma.
 * Cor é controlada pelo renderer do sistema (dourado em Apple/Google/Noto).
 */
export function Marca({ size = 22, className }: Props) {
  return (
    <span
      role="img"
      aria-hidden="true"
      className={className}
      style={{
        fontSize: `${size}px`,
        lineHeight: 1,
        display: 'inline-block',
        fontFamily:
          '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Twemoji Mozilla","EmojiOne Color","Android Emoji",sans-serif',
      }}
    >
      🔱
    </span>
  );
}
