import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * Input minimalista: linha de base + transparência. Sem caixa "balão".
 * O label fica acima (responsabilidade do consumidor); o input é só uma
 * linha grossa embaixo que se acentua quando focado.
 */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-11 w-full rounded-none border-0 border-b border-foreground/30 bg-transparent px-0 py-2 text-base text-foreground transition-colors placeholder:text-muted-foreground hover:border-foreground/60 focus-visible:border-primary focus-visible:outline-none focus-visible:shadow-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
