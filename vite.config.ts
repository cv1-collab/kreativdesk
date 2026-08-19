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
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          maximumFileSizeToCacheInBytes: 10485760, // 10 MB Limit
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [/^\/api/, /^\/assets\//],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
              handler: 'NetworkOnly'
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