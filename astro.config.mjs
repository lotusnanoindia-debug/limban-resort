import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://limban.com', // Required for sitemap
  integrations: [
    sitemap()
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
