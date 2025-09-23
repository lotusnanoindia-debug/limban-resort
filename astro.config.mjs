import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import icon from 'astro-icon';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  site: 'https://limban.com',
  integrations: [
    sitemap(), 
    react(), 
    icon({
      include: {
        bi: ["*"],
        carbon: ["*"],
        "icon-park-outline": ["*"],
        iconoir: ["*"],
        ion: ["*"],
        "material-symbols-light": ["*"],
        mdi: ["*"],
        ph: ["*"],
      }
    }),
  ],
  
  image: {
    format: 'avif',
    quality: 80,
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
