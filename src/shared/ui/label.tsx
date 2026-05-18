import { forwardRef, type LabelHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * Label discreto — sentence case, tamanho pequeno, peso médio. Não usa
 * uppercase tracking-widest (label-eyebrow seria ofensa visual em form
 * grande). Para eyebrows de seção, use .eyebrow utility.
 */
export const Label = forwardRef<
  HTMLLabelElement,
  LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'block text-sm font-medium leading-none text-foreground',
      className,
    )}
    {...props}
  />
));
Label.displayName = 'Label';
