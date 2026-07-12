import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
// PWA Service Worker Import für lokale Installation & Offline-Caching
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './index.css';

// Initialisiert den PWA Service Worker (Background Updates & Caching)
if ('serviceWorker' in navigator) {
  registerSW({ immediate: true });
}

// +++ FIX: GLOBALER BUFFER POLYFILL FÜR PDF & WHITEBOARD +++
// Verhindert Abstürze in Vite, da Node-Module wie "Buffer" im Browser fehlen.
// Da es hier an der Wurzel steht, funktioniert es ab sofort für ALLE Komponenten der App.
if (typeof window !== 'undefined' && typeof window.Buffer === 'undefined') {
  window.Buffer = { from: () => new Uint8Array(), isBuffer: () => false } as any;
}

import * as Sentry from "@sentry/react";

Sentry.init({
  // Fallback auf den direkten Key, falls Vercel die Environment Variable beim Build verschluckt hat
  dsn: import.meta.env.VITE_SENTRY_DSN || "https://84f2745b5dc505891b233869c8a7df39@o4511721911287808.ingest.de.sentry.io/4511721931276368",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, 
  // Session Replay
  replaysSessionSampleRate: 0.1, 
  replaysOnErrorSampleRate: 1.0, 
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);