// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Site URL is used for canonical links, sitemap, OG tags, and JSON-LD.
// When a custom domain lands, change it here and in public/robots.txt.
export default defineConfig({
  site: 'https://nattskift.games',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
