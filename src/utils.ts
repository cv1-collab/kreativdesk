import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  
  if (lower.includes('file:') || lower.includes('/users/') || lower.includes('/desktop/')) {
    if (lower.includes('demo-assets/')) {
      const parts = trimmed.split(/demo-assets\//i);
      const filename = parts[1]?.split('?')[0]?.split('#')[0];
      return filename ? `/demo-assets/${filename}` : '';
    }
    return '';
  }
  return trimmed;
}

export function scrubLocalStorageFileUrls() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const val = localStorage.getItem(key);
      if (val && (val.toLowerCase().includes('file:') || val.toLowerCase().includes('/users/'))) {
        const cleaned = val
          .replace(/file:\/\/\/[^\s"']+\/demo-assets\/([^\s"']+)/gi, '/demo-assets/$1')
          .replace(/file:\/\/\/[^\s"']+/gi, '');
        localStorage.setItem(key, cleaned);
      }
    }
  } catch (e) {
    // Ignore error
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      console.warn('Clipboard writeText failed, falling back:', e);
    }
  }
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback copy to clipboard failed:', err);
    return false;
  }
}