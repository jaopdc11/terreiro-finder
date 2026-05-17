import { forwardRef, type InputHTMLAttributes } from 'react';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  erro?: string | undefined;
}

export const CampoForm = forwardRef<HTMLInputElement, Props>(({ label, erro, id, ...rest }, ref) => {
  const inputId = id ?? rest.name;
  return (
    <div className="space-y-1">
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        ref={ref}
        id={inputId}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? `${inputId}-erro` : undefined}
        {...rest}
      />
      {erro ? (
        <p id={`${inputId}-erro`} role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      ) : null}
    </div>
  );
});
CampoForm.displayName = 'CampoForm';
