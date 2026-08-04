// Google Analytics 4 Helper (DSGVO-konform mit Opt-In)

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export function initGoogleAnalytics(measurementId?: string) {
  const gaId = measurementId || import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!gaId || gaId.includes('XXXXXXXX')) return;

  // Prüfen ob Script bereits geladen ist
  if (document.getElementById('ga-gtag-script')) return;

  // Script dynamisch laden
  const script = document.createElement('script');
  script.id = 'ga-gtag-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', gaId, {
    anonymize_ip: true,
    send_page_view: true
  });

  console.log(`Google Analytics (${gaId}) erfolgreich initialisiert.`);
}

export function trackPageView(url: string) {
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (window.gtag && gaId) {
    window.gtag('config', gaId, {
      page_path: url,
    });
  }
}
