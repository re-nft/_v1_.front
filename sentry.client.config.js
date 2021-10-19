// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NODE_ENV;

Sentry.init({
  dsn: SENTRY_DSN || 'https://1e2b57266178499eb540155e5f5bdbf5@o1018908.ingest.sentry.io/5984702',
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  environment: SENTRY_ENVIRONMENT,
  tunnel: "/api/tunnel"

  // ...
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});
