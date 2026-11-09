import { forwardRef, type InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  erro?: string | undefined;
}

const C =
  'w-full border-0 border-b border-border bg-transparent pb-3 pt-1 text-lg text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none';
const L =
  'mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground';

export const CampoForm = forwardRef<HTMLInputElement, Props>(
  ({ label, erro, id, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <div>
        <label htmlFor={inputId} className={L}>{label}</label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? `${inputId}-erro` : undefined}
          className={C}
          {...rest}
        />
        {erro ? (
          <p
            id={`${inputId}-erro`}
            role="alert"
            className="mt-1.5 text-xs text-destructive"
          >
            {erro}
          </p>
        ) : null}
      </div>
    );
  },
);
CampoForm.displayName = 'CampoForm';
