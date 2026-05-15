import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['daerat-toloba-na-logo.jpg', 'icons.svg'],
      manifest: {
        name: 'Toloba NA — Member',
        short_name: 'Toloba NA',
        description: 'Announcements, surveys, and hub for Toloba NA members.',
        theme_color: '#0A2114',
        background_color: '#FAF6EE',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'daerat-toloba-na-logo.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
          },
          {
            src: 'daerat-toloba-na-logo.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff2}'],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
