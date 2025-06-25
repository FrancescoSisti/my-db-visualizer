import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: './',
  root: './src/renderer',
  build: {
    outDir: './dist',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/renderer/index.html')
    }
  },
  server: {
    port: 5173,
    strictPort: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer'),
      '@/components': resolve(__dirname, 'src/renderer/components'),
      '@/views': resolve(__dirname, 'src/renderer/views'),
      '@/stores': resolve(__dirname, 'src/renderer/stores'),
      '@/types': resolve(__dirname, 'src/renderer/types'),
      '@/utils': resolve(__dirname, 'src/renderer/utils')
    }
  },
  define: {
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false
  }
}) 