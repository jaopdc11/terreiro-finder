import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

/**
 * Botões estilo Linear/Vercel: radius médio, sombra fina, transição suave,
 * sem caixa-alta gritante. Capitalização normal (sentence case).
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-foreground text-background shadow-xs hover:bg-foreground/90 hover:shadow-soft',
        primary:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:shadow-soft',
        outline:
          'border border-border bg-card text-foreground shadow-xs hover:border-foreground/30 hover:bg-secondary',
        ghost:
          'text-foreground hover:bg-secondary',
        destructive:
          'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90',
        link:
          'text-foreground underline-offset-4 hover:underline px-0 shadow-none',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
