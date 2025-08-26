import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// https://vite.dev/config/
const __filename = fileURLToPath((import.meta as any).url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ mode }) => {
  const isLibrary = mode === 'library';

  return {
    plugins: [react()],
    css: {
      postcss: './postcss.config.js',
    },
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
    
    // Конфигурация для сборки библиотеки
    ...(isLibrary && {
      build: {
        emptyOutDir: false, // Не очищать dist полностью
        lib: {
          entry: path.resolve(__dirname, 'src/index.ts'),
          name: 'PolygonEditor',
          fileName: (format) => `index.${format}.js`,
          formats: ['es', 'cjs'],
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'react/jsx-runtime'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              'react/jsx-runtime': 'React',
            },
            // Включить CSS в сборку
            assetFileNames: (assetInfo) => {
              if (assetInfo.name === 'style.css') return 'index.css';
              return assetInfo.name!;
            },
          },
        },
        sourcemap: true,
        minify: 'esbuild',
      },
    }),
  };
});
