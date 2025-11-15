import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [glsl(), tailwindcss()],
  server: {
    fs: {
      allow: ['..', '../..'] // Allow serving files from parent and grandparent directories
    }
  }
})
