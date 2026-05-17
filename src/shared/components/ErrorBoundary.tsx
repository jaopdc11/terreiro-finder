import { Component, type ErrorInfo, type ReactNode } from 'react';
import * as Sentry from '@sentry/react';

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { erro: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { erro: null };

  static getDerivedStateFromError(erro: Error): State {
    return { erro };
  }

  override componentDidCatch(erro: Error, info: ErrorInfo): void {
    Sentry.captureException(erro, { extra: { componentStack: info.componentStack } });
  }

  override render(): ReactNode {
    if (this.state.erro) {
      return (
        this.props.fallback ?? (
          <div role="alert" className="mx-auto max-w-prose px-4 py-12 text-center">
            <h1 className="font-display text-3xl">Deu ruim por aqui.</h1>
            <p className="mt-2 text-muted-foreground">
              Algo travou. Já registramos o erro. Tenta recarregar a página.
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
