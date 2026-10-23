import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// One-file build for sharing the demo as a single HTML page (see scripts/artifact.mjs)
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist-artifact',
    chunkSizeWarningLimit: 2000,
    assetsInlineLimit: 4096000,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
})
