import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (trimmed.includes('file:///')) {
    if (trimmed.includes('demo-assets/')) {
      const filename = trimmed.split('demo-assets/')[1]?.split('?')[0];
      return filename ? `/demo-assets/${filename}` : '';
    }
    return '';
  }
  return trimmed;
}