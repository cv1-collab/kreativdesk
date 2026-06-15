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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);