import { useEffect, useRef, useState } from 'react';
import { Input } from './input';
import { cn } from '@/shared/lib/cn';

interface Props {
  id?: string;
  value: string;
  onChange(v: string): void;
  /** Lista de sugestões filtráveis. Texto livre — usuário pode digitar fora da lista. */
  sugestoes: ReadonlyArray<string>;
  placeholder?: string;
  className?: string;
  'aria-invalid'?: boolean;
}

/**
 * Input com autocomplete custom — substitui o `<datalist>` nativo (que cada
 * browser estiliza diferente). Mostra sugestões num dropdown estilizado
 * abaixo do campo, filtradas pelo que o usuário digita. Continua aceitando
 * texto livre fora da lista.
 *
 * Sem dependência externa (sem cmdk/radix); navegação por teclado básica
 * (Esc fecha, setas navegam, Enter seleciona).
 */
export function Combobox({
  id,
  value,
  onChange,
  sugestoes,
  placeholder,
  className,
  'aria-invalid': ariaInvalid,
}: Props) {
  const [aberto, setAberto] = useState(false);
  const [foco, setFoco] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Filtro case-insensitive sobre o que o usuário já digitou
  const termoLower = value.trim().toLowerCase();
  const filtradas =
    termoLower.length === 0
      ? sugestoes
      : sugestoes.filter((s) => s.toLowerCase().includes(termoLower));

  // Fecha o dropdown quando clica fora
  useEffect(() => {
    if (!aberto) return;
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setAberto(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [aberto]);

  const selecionar = (s: string) => {
    onChange(s);
    setAberto(false);
    setFoco(-1);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setAberto(false);
      setFoco(-1);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!aberto) setAberto(true);
      setFoco((f) => Math.min(filtradas.length - 1, f + 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFoco((f) => Math.max(0, f - 1));
      return;
    }
    if (e.key === 'Enter' && aberto && foco >= 0 && foco < filtradas.length) {
      e.preventDefault();
      selecionar(filtradas[foco]!);
    }
  };

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <Input
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setAberto(true);
          setFoco(-1);
        }}
        onFocus={() => setAberto(true)}
        onKeyDown={onKey}
        placeholder={placeholder}
        aria-invalid={ariaInvalid}
        aria-autocomplete="list"
        aria-expanded={aberto}
        aria-controls={id ? `${id}-list` : undefined}
        role="combobox"
        autoComplete="off"
      />
      {aberto && filtradas.length > 0 ? (
        <ul
          id={id ? `${id}-list` : undefined}
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-border bg-card shadow-md"
        >
          {filtradas.map((s, i) => {
            const ativo = i === foco;
            return (
              <li key={s} role="option" aria-selected={ativo}>
                <button
                  type="button"
                  onMouseDown={(ev) => {
                    ev.preventDefault();
                    selecionar(s);
                  }}
                  onMouseEnter={() => setFoco(i)}
                  className={cn(
                    'flex w-full items-center px-3 py-2 text-left text-sm transition-colors',
                    ativo
                      ? 'bg-secondary text-foreground'
                      : 'text-foreground hover:bg-secondary',
                  )}
                >
                  {s}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
