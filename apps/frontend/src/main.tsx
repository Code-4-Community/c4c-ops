import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { CaptureConsole } from '@sentry/integrations';

import App from './app';

Sentry.init({
  dsn: 'https://240b86f89e3632c60b3fae1404bb159b@o4506153516400640.ingest.sentry.io/4506153522823168',
  environment: import.meta.env.MODE,
  // Offline Caching
  transport: Sentry.makeBrowserOfflineTransport(Sentry.makeFetchTransport),
  transportOptions: {
    maxQueueSize: 100, // default is 30
  },
  integrations: [
    new Sentry.BrowserTracing({
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: [
        'localhost',
        // /^https:\/\/yourserver\.io\/api/,
      ],
    }),
    new Sentry.Replay({ maskAllText: false, blockAllMedia: false }),
    // Capture console, default is ['log', 'info', 'warn', 'error', 'debug', 'assert']
    new CaptureConsole({ levels: ['warn', 'error', 'debug', 'assert'] }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions
  // Session Replay
  replaysSessionSampleRate: 1.0, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

console.info = (message) => {
  Sentry.captureMessage(message, 'info');
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
