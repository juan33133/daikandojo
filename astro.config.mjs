import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://daikandojo.com',
  compressHTML: true,
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'auto'
  },
  vite: {
    build: {
      cssMinify: true
    },
    server: {
      allowedHosts: [
        'ventures-promises-club-bernard.trycloudflare.com',
        'famous-howto-field-childhood.trycloudflare.com'
      ]
    }
  }
});
