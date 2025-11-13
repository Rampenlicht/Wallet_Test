import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Wallet Test',
        short_name: 'Wallet',
        description: 'Wallet Test Application',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/vite.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        // Service Worker wird nicht generiert
        globPatterns: []
      },
      devOptions: {
        enabled: false // Im Development-Modus deaktiviert
      }
    })
  ],
})