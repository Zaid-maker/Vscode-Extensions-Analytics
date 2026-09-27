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

