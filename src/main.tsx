import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
// PWA Service Worker Import für lokale Installation & Offline-Caching
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './index.css';
import { scrubLocalStorageFileUrls } from './utils';

scrubLocalStorageFileUrls();

// Automatische Wiederherstellung bei Vercel-Deployments & veralteten JS-Chunks
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (msg.includes('error loading dynamically imported module') || msg.includes('Failed to fetch dynamically imported module') || msg.includes('Importing a module script failed')) {
      console.warn('[Chunk Error] Veraltetes Modul nach Deployment erkannt. Lade Seite neu...');
      const reloaded = sessionStorage.getItem('chunk_reload_attempted');
      if (!reloaded) {
        sessionStorage.setItem('chunk_reload_attempted', 'true');
        window.location.reload();
      }
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || String(event.reason || '');
    if (reason.includes('error loading dynamically imported module') || reason.includes('Failed to fetch dynamically imported module') || reason.includes('Importing a module script failed')) {
      console.warn('[Chunk Rejection] Veralteter Chunk. Lade Seite neu...');
      const reloaded = sessionStorage.getItem('chunk_reload_attempted');
      if (!reloaded) {
        sessionStorage.setItem('chunk_reload_attempted', 'true');
        window.location.reload();
      }
    }
  });
}

// Initialisiert den PWA Service Worker mit automatischer Cache-Aktualisierung
if ('serviceWorker' in navigator) {
  const updateSW = registerSW({ 
    immediate: true,
    onNeedRefresh() {
      console.log('[PWA SW] Neues Deployment verfügbar, Service Worker aktualisiert Caches...');
      updateSW(true);
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