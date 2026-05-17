import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';

import '../styles/globals.css';
import { App } from './App';

const dsn = import.meta.env.VITE_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  });
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Elemento #root não encontrado no index.html');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
