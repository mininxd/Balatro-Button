import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [glsl()],
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
