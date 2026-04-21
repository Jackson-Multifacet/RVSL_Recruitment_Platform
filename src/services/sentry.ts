import * as Sentry from '@sentry/react';

export function initializeSentry() {
  // Only initialize Sentry in production or if explicitly enabled
  if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_SENTRY === 'true') {
    Sentry.init({
      // Replace with your actual Sentry DSN
      dsn: import.meta.env.VITE_SENTRY_DSN || 'https://examplePublicKey@o0.ingest.sentry.io/0',
      environment: import.meta.env.MODE,
      // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    });
  }
}

export default Sentry;
