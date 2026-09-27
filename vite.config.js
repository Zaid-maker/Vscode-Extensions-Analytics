import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // The test runner needs the JSX transform only; compiler + CSS are noise there
    ...(mode !== 'test'
      ? [babel({ presets: [reactCompilerPreset()] }), tailwindcss()]
      : []),
  ],
  server: {
    proxy: {
      '/api/marketplace': {
        target: 'https://marketplace.visualstudio.com',
        changeOrigin: true,
        // changeOrigin only rewrites Host; the browser's Origin and User-Agent
        // are relayed as-is, and the marketplace rejects localhost origins
        // and some embedded-browser UAs ("User agent is blocked.").
        headers: {
          Origin: 'https://marketplace.visualstudio.com',
          Referer: 'https://marketplace.visualstudio.com/',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        },
        rewrite: (path) => path.replace(/^\/api\/marketplace/, '')
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false
  }
}))

