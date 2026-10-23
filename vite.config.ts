import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // relative asset paths so the build also works from a sub-folder or a single-file export
  base: './',
  build: {
    chunkSizeWarningLimit: 1400,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/postprocessing'],
        },
      },
    },
  },
})
