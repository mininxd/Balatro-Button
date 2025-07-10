import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  root: 'docs',
  base: './',
  publicDir: 'assets',
  plugins: [glsl(), tailwindcss()],
  build: {
    outDir: '../dist'
  }
})
