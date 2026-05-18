import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * Input estilo Linear/Vercel: caixa com radius médio, sombra fina, padding
 * generoso. Border acentua suavemente no foco.
 */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-9 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground shadow-xs ring-offset-background transition-colors placeholder:text-muted-foreground hover:border-foreground/20 focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
