import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * Card — superfície padrão pra agrupar conteúdo. Borda sutil + sombra
 * quente (token --shadow-warm-sm). Use `interactive` quando o card é
 * clicável (vira link/wrapper de botão) — ganha hover state.
 *
 * Substitui o uso "rounded-lg border border-border bg-card p-6" espalhado
 * pelo código.
 */
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

const padMap = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive, padding = 'md', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'card-surface',
        interactive && 'card-surface-hover cursor-pointer',
        padMap[padding],
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4 space-y-1.5', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('font-display text-xl leading-tight text-foreground', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm text-foreground/90', className)} {...props} />
  ),
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mt-5 flex items-center gap-2', className)} {...props} />
  ),
);
CardFooter.displayName = 'CardFooter';
