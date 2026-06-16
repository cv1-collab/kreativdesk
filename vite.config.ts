import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
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
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          maximumFileSizeToCacheInBytes: 5000000, 
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/firebase\.googleapis\.com\/.*$/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'firebase-auth-cache',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 }
              }
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      global: 'window',
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        // +++ DER HARTE FIX: Erzwingt die reine Browser-ESM-Version ohne CJS-Konflikte +++
        '@react-pdf/renderer': '@react-pdf/renderer/lib/react-pdf.browser.es.js'
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
      minify: 'terser',
      terserOptions: {
        compress: {
          keep_classnames: true,
          keep_fnames: true,
        },
        mangle: {
          keep_classnames: true,
          keep_fnames: true,
        }
      },
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-core': ['react', 'react-dom', 'react-router-dom'],
            'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage', 'firebase/functions'],
            'vendor-ui': ['lucide-react', 'motion/react', 'clsx', 'tailwind-merge'],
            'vendor-3d': ['three', '@react-three/fiber', '@react-three/drei'],
            'vendor-charts': ['recharts'],
            // +++ vendor-pdf entfernt: Wir lassen Rollup die PDF-Abhängigkeiten natürlich auflösen +++
          }
        }
      },
      chunkSizeWarningLimit: 1500 
    }
  };
});