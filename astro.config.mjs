import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import icon from 'astro-icon';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  site: 'https://limban.com',
  integrations: [sitemap(), react(), icon()],
  
  image: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.graphassets.com',
      }
    ]
  },
  
  vite: {
    css: {
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
    },
  },
});
