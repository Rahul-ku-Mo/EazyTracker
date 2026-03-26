import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import * as Sentry from "@sentry/react";

Sentry.init({
    dsn: "https://75627830a1231cc42486e2e160785006@o4509571220766720.ingest.us.sentry.io/4509571222732800",
    integrations: [Sentry.browserTracingIntegration()],
  
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ["localhost", /^https:\/\/localhost:\d+\/api\//],
  });

createRoot(document.getElementById('root')!).render(
    <App />
)
