import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

/**
 * Botões minimalistas geométricos: radius mínimo, sem sombra. Hover inverte
 * cor em vez de alterar opacidade. Foco é box-shadow rígido (no globals.css).
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-medium transition-colors duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-foreground text-background hover:bg-primary',
        primary:
          'bg-primary text-primary-foreground hover:bg-foreground',
        outline:
          'border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background',
        ghost: 'text-foreground hover:bg-foreground/5',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-foreground',
        link: 'text-foreground underline-offset-4 hover:underline px-0',
      },
      size: {
        default: 'h-11 px-5 text-sm tracking-wide uppercase',
        sm: 'h-9 px-4 text-xs tracking-wider uppercase',
        lg: 'h-14 px-8 text-sm tracking-widest uppercase',
        icon: 'h-10 w-10',
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
