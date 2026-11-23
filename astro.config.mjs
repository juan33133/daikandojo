import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://daikandojo.es',
  compressHTML: true,
  integrations: [
    sitemap({
      // Páginas que solo redirigen no deben indexarse
      filter: (page) => !page.endsWith('/disciplinas/'),
    }),
  ],
  build: {
    inlineStylesheets: 'auto'
  },
  vite: {
    build: {
      cssMinify: true
    }
  }
});
