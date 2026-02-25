import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://daikandojo.com',
  compressHTML: true,
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
