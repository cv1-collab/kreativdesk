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
  const isChunkOrMimeError = (msg: string) => {
    const s = String(msg || '').toLowerCase();
    return s.includes('error loading dynamically imported module') ||
           s.includes('failed to fetch dynamically imported module') ||
           s.includes('importing a module script failed') ||
           s.includes('is not a valid javascript mime type') ||
           s.includes('mime type') ||
           s.includes('text/html');
  };

  const attemptReload = () => {
    const lastReload = Number(sessionStorage.getItem('chunk_reload_timestamp') || '0');
    const now = Date.now();
    if (now - lastReload > 30000) {
      sessionStorage.setItem('chunk_reload_timestamp', String(now));
      window.location.reload();
    }
  };

  window.addEventListener('error', (event) => {
    const msg = event.message || event.error?.message || '';
    if (isChunkOrMimeError(msg)) {
      console.warn('[Chunk/MIME Error] Veraltetes Modul nach Deployment erkannt. Lade Seite neu...');
      attemptReload();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || String(event.reason || '');
    if (isChunkOrMimeError(reason)) {
      console.warn('[Chunk/MIME Rejection] Veralteter Chunk nach Deployment. Lade Seite neu...');
      attemptReload();
    }
  });

  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    console.warn('[Vite Preload Error] Neuer Build verfügbar, aktualisiere Seite...');
    attemptReload();
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
    // Verhindert Sentry-Meldungen bei veralteten Deployments, unterbrochenen Netzwerkverbindungen oder Browser-Blockern
    const isNetworkOrStaleChunkError = event.exception?.values?.some(v => {
      const val = (v.value || '').toLowerCase();
      return val.includes('networkerror') ||
             val.includes('cors') ||
             val.includes('is not a valid javascript mime type') ||
             val.includes('failed to fetch dynamically imported module') ||
             val.includes('importing a module script failed');
    });
    if (isNetworkOrStaleChunkError) {
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