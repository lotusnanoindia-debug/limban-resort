// Centralized Cloudinary configuration and utility
export const CLOUDINARY_CONFIG = {
  cloudName: "dfa5hhzej",
  variants: {
    roomCardHome: "w_400,h_300,c_fill",
    roomCard: "w_590,h_400,c_fill",
    serviceCard: "w_400,h_300,c_fill",
    subhero: "w_600,h_750,c_fill",
    heroDesktop: "w_1600,h_900,c_fill",
    heroMobile: "w_768,h_432,c_fill",
    heroTablet: "w_1024,h_576,c_fill",
    hero4K: "w_2560,h_1440,c_fill",
    thumbnail: "w_92,h_92,c_fill",
    gallery: "w_800,h_600,c_fill",
    large: "w_1000,h_750,c_fill",
    logo: "w_40,h_40,c_fill",
    headerTile: "w_200,h_200,c_fill",
  },
};

export function getCloudinaryUrl(hygraphUrl, variant = 'gallery', options = {}) {
  if (!hygraphUrl) return '/img/placeholder.webp';
  
  const defaults = { quality: 65, format: 'avif' };
  const config = { ...defaults, ...options };
  
  const transformation = CLOUDINARY_CONFIG.variants[variant] || "w_800,h_600,c_fill";
  const qualityParam = `,q_${config.quality}`;
  const formatParam = `,f_${config.format}`;
  
  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/fetch/${transformation}${qualityParam}${formatParam}/${encodeURIComponent(hygraphUrl)}`;
}
