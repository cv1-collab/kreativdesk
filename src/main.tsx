import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
// PWA Service Worker Import für lokale Installation & Offline-Caching
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './index.css';
import { scrubLocalStorageFileUrls } from './utils';

scrubLocalStorageFileUrls();

// Initialisiert den PWA Service Worker (Hintergrund-Caching ohne störendes Neuladen)
if ('serviceWorker' in navigator) {
  registerSW({ 
    immediate: true,
    onNeedRefresh() {
      // Aktualisiert Caches geräuschlos im Hintergrund ohne die App neu zu laden
    },
    onOfflineReady() {}
  });
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
  enabled: import.meta.env.PROD, // In lokaler Entwicklung (dev) deaktiviert, um Adblocker/CORS-Spam im Browser zu vermeiden
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 0.2, 
  // Session Replay
  replaysSessionSampleRate: 0.05, 
  replaysOnErrorSampleRate: 1.0, 
  beforeSend(event) {
    // Verhindert Sentry-Meldungen bei unterbrochenen Netzwerkverbindungen oder Browser-Blockern
    if (event.exception?.values?.some(v => v.value?.includes('NetworkError') || v.value?.includes('CORS'))) {
      return null;
    }
    return event;
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);