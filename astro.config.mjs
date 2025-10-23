import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import icon from "astro-icon";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import netlify from "@astrojs/netlify";

import mailObfuscation from "astro-mail-obfuscation";

export default defineConfig({
  output: "static",
  site: "https://limban.com",
  trailingSlash: "always", // required internally for folder structure
  build: { format: "directory" },
  integrations: [
    sitemap({
      serialize(item) {
        // Remove trailing slash from URLs
        item.url = item.url.replace(/\/$/, "");

        // Homepage - highest priority
        if (item.url === "https://limban.com") {
          item.priority = 1.0;
          item.changefreq = "weekly";
        }
        // Core pages - high priority
        else if (
          item.url.match(
            /\/(rooms|safaris|dining|vibe|contact|activities|wellness)$/,
          )
        ) {
          item.priority = 0.9;
          item.changefreq = "monthly";
        }
        // Individual rooms/dining - medium-high
        else if (item.url.match(/\/(rooms|dining)\/.+/)) {
          item.priority = 0.8;
          item.changefreq = "monthly";
        }
        // Guest gallery - updates frequently
        else if (item.url.includes("/guest-gallery")) {
          item.priority = 0.7;
          item.changefreq = "weekly";
        }
        // Info pages
        else if (item.url.match(/\/(about|tadoba|guest-terms)$/)) {
          item.priority = 0.6;
          item.changefreq = "monthly";
        }
        // Legal/terms - low priority
        else if (item.url.match(/\/(privacy-policy)$/)) {
          item.priority = 0.5;
          item.changefreq = "yearly";
        }
        // Default
        else {
          item.priority = 0.5;
          item.changefreq = "monthly";
        }

        item.lastmod = new Date();
        return item;
      },
    }),
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
      },
    }),
    mailObfuscation(),
  ],

  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
    domains: ["res.cloudinary.com"],
    format: "avif",
    quality: 80,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.graphassets.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  vite: {
    css: {
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
    },
  },
});
