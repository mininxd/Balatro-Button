import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import tailwindcss from '@tailwindcss/vite';
import packages from './package.json';

export default defineConfig({
  plugins: [glsl(), tailwindcss()],
  define: {
    APP_VER: JSON.stringify(packages.version)
  },
  server: {
    fs: {
      allow: ['..', '../..']
    }
  }
})
