// Se importa primero que nada en index.js — Sentry necesita inicializarse
// antes del resto del código para poder instrumentarlo. Sin SENTRY_DSN
// (desarrollo local, tests, docker-compose) el SDK queda deshabilitado solo.
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
  tracesSampleRate: 1.0,
});
