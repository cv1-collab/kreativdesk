import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  const DEFAULT_SUPABASE_URL = 'https://jtgfrogbrkrllzdwzdrt.supabase.co';
  const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Z2Zyb2dicmtybGx6ZHd6ZHJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0ODMzOTcsImV4cCI6MjEwMTA1OTM5N30.WHFlicuJoJ2xSevb2-HvWgPml8Rwz28fTOFppQkvlYE';

  const rawUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const rawKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  const cleanUrl = typeof rawUrl === 'string' ? rawUrl.replace(/^["']|["']$/g, '').trim() : '';
  const cleanKey = typeof rawKey === 'string' ? rawKey.replace(/^["']|["']$/g, '').trim() : '';
  const resolvedUrl = cleanUrl && cleanUrl.startsWith('http') ? cleanUrl : DEFAULT_SUPABASE_URL;
  const resolvedKey = cleanKey && cleanKey.length > 20 ? cleanKey : DEFAULT_SUPABASE_ANON_KEY;

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          name: 'Kreativ Desk OS',
          short_name: 'Kreativ Desk',
          description: 'Das Operating System für komplexe Projekte.',
          theme_color: '#09090b',
          background_color: '#09090b',
          display: 'standalone',
          orientation: 'any',
          start_url: '/',
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
          ]
        },
        workbox: {
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,webp}'],
          globIgnores: [
            '**/BIMViewer*.js',
            '**/vendor-three*.js',
            '**/vendor-ifc*.js',
            '**/vendor-r3f*.js',
            '**/vendor-react-pdf*.js',
            '**/vendor-pdf-tools*.js'
          ],
          maximumFileSizeToCacheInBytes: 10485760, // 10 MB Limit
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [/^\/api/, /^\/assets\//, /^\/media\//, /^\/demo-assets\//, /^\/wasm\//, /\.wasm$/],
          runtimeCaching: [
            {
              urlPattern: /\/media\/.*\.(?:png|jpg|jpeg|svg|webp|gif)$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'media-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30
                }
              }
            },
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
              handler: 'NetworkOnly'
            },
            {
              urlPattern: /\/assets\/.*(BIMViewer|UniversalPDFStudio|vendor-three|vendor-ifc|vendor-r3f|vendor-react-pdf|vendor-pdf-tools).*\.js$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'heavy-studios-cache',
                expiration: {
                  maxEntries: 15,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days cache for heavy 3D/PDF engines
                }
              }
            }
          ]
        }
      })
    ],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(resolvedUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(resolvedKey),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(resolvedUrl),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(resolvedKey),
      global: 'window',
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext',
      }
    },
    build: {
      target: 'esnext',
      sourcemap: false,
      minify: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (
                id.includes('/react/') ||
                id.includes('/react-dom/') ||
                id.includes('/react-router') ||
                id.includes('/scheduler/') ||
                id.includes('/use-sync-external-store/')
              ) {
                return 'vendor-core';
              }
              if (id.includes('web-ifc')) {
                return 'vendor-ifc';
              }
              if (
                id.includes('@react-three') ||
                id.includes('three-stdlib') ||
                id.includes('maath') ||
                id.includes('camera-controls') ||
                id.includes('meshline') ||
                id.includes('troika')
              ) {
                return 'vendor-r3f';
              }
              if (id.includes('/three/')) {
                return 'vendor-three';
              }
              if (
                id.includes('@react-pdf') ||
                id.includes('yoga-layout') ||
                id.includes('fontkit') ||
                id.includes('pdfkit')
              ) {
                return 'vendor-react-pdf';
              }
              if (
                id.includes('jspdf') ||
                id.includes('pdf-lib') ||
                id.includes('html2canvas') ||
                id.includes('html-to-image') ||
                id.includes('pdfjs-dist')
              ) {
                return 'vendor-pdf-tools';
              }
              if (id.includes('konva') || id.includes('react-konva')) {
                return 'vendor-canvas';
              }
              if (id.includes('/xlsx') || id.includes('pptxgenjs')) {
                return 'vendor-office';
              }
              if (id.includes('recharts') || id.includes('d3-')) {
                return 'vendor-charts';
              }
              if (id.includes('@supabase')) {
                return 'vendor-supabase';
              }
              if (id.includes('lucide-react') || id.includes('clsx') || id.includes('tailwind-merge')) {
                return 'vendor-ui';
              }
            }
          }
        }
      },
      chunkSizeWarningLimit: 2700
    }
  };
});