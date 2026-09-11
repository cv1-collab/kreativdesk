/**
 * Brand Color Manager
 * Dynamically controls, applies, and persists instance-wide branding accent colors.
 * Synchronizes with Tailwind v4 CSS variables (--color-blue-*, --color-brand-*, etc.)
 * across the entire Kreativ-Desk application.
 */

import { safeStorage } from './safeStorage';
import { fetchSystemConfigJSON } from './configHelper';

export const DEFAULT_BRAND_COLOR = '#3b82f6'; // Standard Kreativ Desk Swiss Blue
const STORAGE_KEY = 'custom_accent_color';
const STYLE_TAG_ID = 'kreativdesk-dynamic-brand-styles';

export interface ColorShades {
  primary: string;
  hover: string;
  active: string;
  lighter: string;
  tint: string;
  borderTint: string;
  glow: string;
}

/**
 * Parses hex strings (#RGB or #RRGGBB) to RGB object.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!hex || typeof hex !== 'string') return null;
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  return null;
}

/**
 * Converts RGB components to hex code.
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    '#' +
    [r, g, b]
      .map(x => clamp(x).toString(16).padStart(2, '0'))
      .join('')
  );
}

/**
 * Adjusts brightness of an RGB color by a percentage (-100 to +100).
 */
export function adjustBrightness(rgb: { r: number; g: number; b: number }, percent: number): string {
  const factor = 1 + percent / 100;
  return rgbToHex(rgb.r * factor, rgb.g * factor, rgb.b * factor);
}

/**
 * Calculates complete palette shades and RGBA tints from a single primary hex color.
 */
export function calculateBrandShades(hex: string): ColorShades {
  const rgb = hexToRgb(hex) || hexToRgb(DEFAULT_BRAND_COLOR)!;
  const primary = rgbToHex(rgb.r, rgb.g, rgb.b);
  const hover = adjustBrightness(rgb, -14); // 14% darker for hover states
  const active = adjustBrightness(rgb, -24); // 24% darker for active states
  const lighter = adjustBrightness(rgb, +14); // 14% brighter for 500 shade
  const tint = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`;
  const borderTint = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`;
  const glow = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.50)`;

  return {
    primary,
    hover,
    active,
    lighter,
    tint,
    borderTint,
    glow,
  };
}

/**
 * Applies the given brand accent color dynamically to the document root and injects
 * overriding CSS variables so Tailwind utilities (e.g., bg-blue-600, text-blue-500, etc.)
 * instantly adapt without full page reload.
 */
export function applyBrandColor(hex: string, persist: boolean = true): ColorShades {
  const shades = calculateBrandShades(hex);

  if (typeof document !== 'undefined') {
    const root = document.documentElement;

    // 1. Direct CSS properties on :root
    root.style.setProperty('--color-blue-600', shades.primary);
    root.style.setProperty('--color-blue-500', shades.lighter);
    root.style.setProperty('--color-blue-700', shades.hover);
    root.style.setProperty('--color-brand-600', shades.primary);
    root.style.setProperty('--color-brand-500', shades.lighter);
    root.style.setProperty('--color-brand-400', shades.lighter);
    root.style.setProperty('--color-brand-primary', shades.primary);
    root.style.setProperty('--brand-color', shades.primary);
    root.style.setProperty('--brand-hover', shades.hover);
    root.style.setProperty('--brand-tint', shades.tint);
    root.style.setProperty('--brand-border', shades.borderTint);
    root.style.setProperty('--brand-glow', shades.glow);

    // 2. Dynamic high-priority style tag to ensure deep priority over any precompiled rules
    let styleTag = document.getElementById(STYLE_TAG_ID) as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = STYLE_TAG_ID;
      document.head.appendChild(styleTag);
    }

    styleTag.textContent = `
      :root {
        --color-blue-600: ${shades.primary} !important;
        --color-blue-500: ${shades.lighter} !important;
        --color-blue-700: ${shades.hover} !important;
        --color-brand-600: ${shades.primary} !important;
        --color-brand-500: ${shades.lighter} !important;
        --color-brand-400: ${shades.lighter} !important;
        --brand-color: ${shades.primary} !important;
        --brand-hover: ${shades.hover} !important;
        --brand-tint: ${shades.tint} !important;
        --brand-border: ${shades.borderTint} !important;
        --brand-glow: ${shades.glow} !important;
      }
    `;

    // 3. Dispatch window event for listening components (e.g. Canvas, PDF previews)
    window.dispatchEvent(
      new CustomEvent('brand_color_changed', {
        detail: { color: shades.primary, shades }
      })
    );
  }

  if (persist) {
    safeStorage.setItem(STORAGE_KEY, shades.primary);
  }

  return shades;
}

/**
 * Initializes the brand accent color on application bootstrap.
 * 1. Synchronously reads cached color from safeStorage for zero layout flash.
 * 2. Asynchronously fetches latest master branding from Supabase system_config.
 */
export async function initBrandColor(): Promise<string> {
  // Step 1: Immediate cache read
  const cachedColor = safeStorage.getItem<string>(STORAGE_KEY, DEFAULT_BRAND_COLOR);
  if (cachedColor && cachedColor !== DEFAULT_BRAND_COLOR) {
    applyBrandColor(cachedColor, false);
  }

  // Step 2: Remote sync
  try {
    const docConfig = await fetchSystemConfigJSON<{ accentColor?: string }>('global_master');
    if (docConfig?.accentColor) {
      applyBrandColor(docConfig.accentColor, true);
      return docConfig.accentColor;
    }
  } catch (err) {
    console.warn('[brandColorManager] Error syncing remote brand color:', err);
  }

  return cachedColor || DEFAULT_BRAND_COLOR;
}

/**
 * Resets the brand color back to default Kreativ Desk Blue.
 */
export function resetBrandColor(): void {
  applyBrandColor(DEFAULT_BRAND_COLOR, true);
}
