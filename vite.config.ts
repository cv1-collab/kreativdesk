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
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
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
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          globIgnores: ['**/BIMViewer*.js'],
          maximumFileSizeToCacheInBytes: 10485760, // 10 MB Limit
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [/^\/api/, /^\/assets\//],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
              handler: 'NetworkOnly'
            },
            {
              urlPattern: /\/assets\/.*(BIMViewer|UniversalPDFStudio|vendor-3d).*\.js$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'heavy-studios-cache',
                expiration: {
                  maxEntries: 10,
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
      'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || ''),
      global: 'window',
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'firebase/app': path.resolve(__dirname, 'src/lib/firebaseMock.ts'),
        'firebase/auth': path.resolve(__dirname, 'src/lib/firebaseMock.ts'),
        'firebase/firestore': path.resolve(__dirname, 'src/lib/firebaseMock.ts'),
        'firebase/storage': path.resolve(__dirname, 'src/lib/firebaseMock.ts'),
        'firebase/functions': path.resolve(__dirname, 'src/lib/firebaseMock.ts'),
        'firebase/app-check': path.resolve(__dirname, 'src/lib/firebaseMock.ts'),
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
      minify: false,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-core': ['react', 'react-dom', 'react-router-dom'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-ui': ['lucide-react', 'clsx', 'tailwind-merge'],
            'vendor-3d': ['three', '@react-three/fiber', '@react-three/drei'],
            'vendor-charts': ['recharts']
          }
        }
      },
      chunkSizeWarningLimit: 3000
    }
  };
});