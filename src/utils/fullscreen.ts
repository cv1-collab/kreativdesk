/**
 * Utility for safe cross-browser Fullscreen API management with fallback support.
 * Prevents TypeError when requestFullscreen or exitFullscreen is undefined (e.g. iOS Safari / iPhone).
 */

export function isFullscreenActive(): boolean {
  if (typeof document === 'undefined') return false;
  const doc = document as any;
  return !!(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  );
}

export function isFullscreenSupported(element?: HTMLElement | null): boolean {
  if (typeof document === 'undefined') return false;
  const target = (element || document.documentElement) as any;
  return !!(
    target &&
    (typeof target.requestFullscreen === 'function' ||
     typeof target.webkitRequestFullscreen === 'function' ||
     typeof target.mozRequestFullScreen === 'function' ||
     typeof target.msRequestFullscreen === 'function')
  );
}

export async function safeRequestFullscreen(element: HTMLElement | null): Promise<boolean> {
  if (!element) return false;
  const el = element as any;

  try {
    if (typeof el.requestFullscreen === 'function') {
      await el.requestFullscreen();
      return true;
    }
    if (typeof el.webkitRequestFullscreen === 'function') {
      await el.webkitRequestFullscreen();
      return true;
    }
    if (typeof el.mozRequestFullScreen === 'function') {
      await el.mozRequestFullScreen();
      return true;
    }
    if (typeof el.msRequestFullscreen === 'function') {
      await el.msRequestFullscreen();
      return true;
    }
  } catch (err) {
    console.warn('Native requestFullscreen failed or blocked:', err);
  }
  return false;
}

export async function safeExitFullscreen(): Promise<boolean> {
  if (typeof document === 'undefined') return false;
  const doc = document as any;

  try {
    if (typeof doc.exitFullscreen === 'function') {
      await doc.exitFullscreen();
      return true;
    }
    if (typeof doc.webkitExitFullscreen === 'function') {
      await doc.webkitExitFullscreen();
      return true;
    }
    if (typeof doc.mozCancelFullScreen === 'function') {
      await doc.mozCancelFullScreen();
      return true;
    }
    if (typeof doc.msExitFullscreen === 'function') {
      await doc.msExitFullscreen();
      return true;
    }
  } catch (err) {
    console.warn('Native exitFullscreen failed or blocked:', err);
  }
  return false;
}

export function addFullscreenChangeListener(callback: () => void): () => void {
  if (typeof document === 'undefined') return () => {};

  const events = [
    'fullscreenchange',
    'webkitfullscreenchange',
    'mozfullscreenchange',
    'MSFullscreenChange'
  ];

  events.forEach(event => {
    document.addEventListener(event, callback);
  });

  return () => {
    events.forEach(event => {
      document.removeEventListener(event, callback);
    });
  };
}
