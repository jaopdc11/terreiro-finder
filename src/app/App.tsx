import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { QueryProvider } from './providers/QueryProvider';
import { ServicesProvider } from './providers/ServicesProvider';
import { AuthProvider } from './providers/AuthProvider';
import { Router } from './Router';

export function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ServicesProvider>
          <AuthProvider>
            <BrowserRouter>
              <Router />
            </BrowserRouter>
          </AuthProvider>
        </ServicesProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
