import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api/marketplace': {
        target: 'https://marketplace.visualstudio.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/marketplace/, '')
      }
    }
  }
})

