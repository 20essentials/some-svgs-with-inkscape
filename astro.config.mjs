// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
// https://astro.build/config
export default defineConfig({
  build: {
    assets: 'static'
  },
  base: import.meta.env.DEV ? undefined : '/some-svgs-with-inkscape-part-2/',
  site: import.meta.env.DEV
    ? 'http://localhost:4321/'
    : 'https://20essentials.github.io/some-svgs-with-inkscape-part-2/',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()]
  }
});
