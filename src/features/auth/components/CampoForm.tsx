import { forwardRef, type InputHTMLAttributes } from 'react';
import { Input } from '@/shared/ui/input';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  erro?: string | undefined;
}

/**
 * Campo de formulário editorial: label em eyebrow (uppercase compacto)
 * acima, input minimalista embaixo. Erro em linha tracejada vermelha.
 */
export const CampoForm = forwardRef<HTMLInputElement, Props>(
  ({ label, erro, id, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <div className="space-y-2">
        <label htmlFor={inputId} className="eyebrow block text-muted-foreground">
          {label}
        </label>
        <Input
          ref={ref}
          id={inputId}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? `${inputId}-erro` : undefined}
          {...rest}
        />
        {erro ? (
          <p
            id={`${inputId}-erro`}
            role="alert"
            className="border-l-2 border-destructive pl-2 text-xs text-destructive"
          >
            {erro}
          </p>
        ) : null}
      </div>
    );
  },
);
CampoForm.displayName = 'CampoForm';
