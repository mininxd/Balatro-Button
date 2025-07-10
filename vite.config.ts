import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [glsl(), tailwindcss()],
  css: {
    postcss: './postcss.config.js'
  },
  build: {
    lib: {
      entry: 'src/main.js',
      name: 'balatroButton',
      fileName: 'balatro-button',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: [],
      output: {
      exports: 'named'
    }
    }
  }
})
