import { forwardRef, type LabelHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * Label minimalista — uppercase compacto, espaçado, em eyebrow.
 * Combina com Input em linha de base (sem caixa). Override via className.
 */
export const Label = forwardRef<
  HTMLLabelElement,
  LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground',
      className,
    )}
    {...props}
  />
));
Label.displayName = 'Label';
