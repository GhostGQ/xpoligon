import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

// https://vite.dev/config/
const __filename = fileURLToPath((import.meta as any).url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@app': path.resolve(__dirname, 'src', 'app'),
      '@shared': path.resolve(__dirname, 'src', 'shared'),
      '@entities': path.resolve(__dirname, 'src', 'entities'),
      '@features': path.resolve(__dirname, 'src', 'features'),
      '@widgets': path.resolve(__dirname, 'src', 'widgets'),
      '@pages': path.resolve(__dirname, 'src', 'pages'),
      '@processes': path.resolve(__dirname, 'src', 'processes'),
    },
  },
})
