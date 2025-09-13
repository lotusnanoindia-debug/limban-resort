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
  experimental: {
    contentSecurityPolicy: {
      default: ["'self'"],
      "img-src": ["'self'", "https://*.graphassets.com", "https://assets.hygraph.com", "https://*.sirv.com", "https://challenges.cloudflare.com", "data:"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
      "style-src": ["'self'", "https://fonts.googleapis.com"],
      "frame-src": ["https://challenges.cloudflare.com"],
      "script-src": ["'self'", "https://challenges.cloudflare.com"]
    }
  }
});
