import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App.jsx';
import './index.css';

// Sin VITE_SENTRY_DSN (dev local, o un build que no lo recibió) el SDK queda
// deshabilitado solo. El DSN se hornea en el bundle en build-time (Vite), no
// es una variable de entorno de runtime como BACKEND_URL — ver frontend/Dockerfile.
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
