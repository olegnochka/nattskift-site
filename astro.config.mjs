// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Site URL is used for canonical links, sitemap, and OG tags.
// Swap for the real domain before going live (also update scripts/generate-og.mjs README note).
export default defineConfig({
  site: 'https://nattskift.games',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
