/**
 * High-performance AI Image-to-Image Rendering Service for BIMViewer and Whiteboard.
 * Connects directly to Fal Flux Dev image-to-image with server proxy and direct fallback.
 */

import { supabase } from '../lib/supabase';

interface RenderOptions {
  prompt: string;
  image: string; // base64 data URL
  strength?: number;
  style?: 'photoreal' | 'sketch' | 'comic' | 'cyberpunk' | 'twilight';
  guidanceScale?: number;
}

interface RenderResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

const FAL_DEFAULT_KEY = '74ab3a75-7a36-4c81-b6b1-e7efde8627e0:396cf0c00fcf01484883bc3e6850a073';

/**
 * Resizes an image data URL down to maximum 1024x1024 JPEG to ensure fast upload
 * and eliminate Vercel 4.5MB payload limits.
 */
export async function optimizeImageForDiffusion(dataUrl: string, maxDim: number = 1024): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || typeof window === 'undefined') return resolve(dataUrl);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let { width, height } = img;
      if (width <= maxDim && height <= maxDim) {
        return resolve(dataUrl);
      }

      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      // White/solid background behind transparent pixels
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Renders an image using Flux Dev image-to-image with primary server proxy
 * and direct browser fallback.
 */
export async function requestAIRender(options: RenderOptions): Promise<RenderResult> {
  try {
    const optimizedImage = await optimizeImageForDiffusion(options.image, 1024);
    const strength = options.strength !== undefined ? options.strength : 0.55;

    // 1. Primary: Server Proxy (/api/render-image)
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/render-image', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt: options.prompt,
          image: optimizedImage,
          strength,
          style: options.style || 'photoreal',
          guidance_scale: options.guidanceScale || 7.5
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.imageUrl) {
          return { success: true, imageUrl: data.imageUrl };
        }
      } else {
        const errText = await response.text();
        console.warn('[AIRenderService] Server proxy non-OK:', response.status, errText);
      }
    } catch (proxyErr) {
      console.warn('[AIRenderService] Server proxy fetch error, attempting direct Fal:', proxyErr);
    }

    // 2. Secondary Direct Fallback: Fal.run Flux Dev
    try {
      const falRes = await fetch('https://fal.run/fal-ai/flux/dev/image-to-image', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${FAL_DEFAULT_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: options.prompt,
          image_url: optimizedImage,
          strength,
          guidance_scale: options.guidanceScale || 7.5,
          num_inference_steps: 28
        })
      });

      if (falRes.ok) {
        const falData = await falRes.json();
        const url = falData?.images?.[0]?.url;
        if (url) {
          return { success: true, imageUrl: url };
        }
      } else {
        const falErr = await falRes.text();
        console.error('[AIRenderService] Direct Fal failed:', falRes.status, falErr);
        return { success: false, error: `KI-Render-Fehler (${falRes.status}): ${falErr.slice(0, 120)}` };
      }
    } catch (directErr: any) {
      console.error('[AIRenderService] Direct Fal exception:', directErr);
      return { success: false, error: directErr?.message || 'Verbindungsfehler zur KI-Engine' };
    }

    return { success: false, error: 'Kein Bild von der KI-Engine zurückgegeben.' };
  } catch (err: any) {
    console.error('[AIRenderService] Fatal error in requestAIRender:', err);
    return { success: false, error: err?.message || 'Unerwarteter Fehler bei der KI-Generierung' };
  }
}
