import { forwardRef, type LabelHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('block text-sm font-medium leading-none text-foreground', className)}
      {...props}
    />
  ),
);
Label.displayName = 'Label';
