/**
 * Enterprise ImageService - Complete Cloudinary Integration
 * Fixed version without fl_attachment for fetch URLs
 * Zero raw URLs escape this system
 */

// Core Configuration
export const IMAGE_CONFIG = {
  cloudName: "dfa5hhzej",

  // Image variants with specific use cases
  variants: {
    // Hero images - different breakpoints
    heroDesktop: "w_1600,h_900,c_fill",
    heroTablet: "w_1024,h_576,c_fill",
    heroMobile: "w_768,h_432,c_fill",
    hero4K: "w_2560,h_1440,c_fill",

    // Card layouts
    roomCard: "w_590,h_400,c_fill",
    roomCardHome: "w_400,h_300,c_fill",
    serviceCard: "w_400,h_400,c_fill",

    // Gallery system
    gallery: "w_400,h_300,c_fill",
    galleryLarge: "w_1200,h_900,c_fill",
    thumbnail: "w_92,h_92,c_fill",

    // Specialized layouts
    subhero: "w_600,h_750,c_fill",
    logo: "w_200,h_200,c_fit",
    logoSmall: "w_40,h_40,c_fit",
    headerTile: "w_200,h_200,c_fill",

    // Modal and lightbox
    modal: "w_1400,h_1050,c_limit",
    modalFallback: "w_800,h_600,c_limit",

    // Responsive sizes
    small: "w_400,h_300,c_fill",
    medium: "w_600,h_450,c_fill",
    large: "w_1000,h_750,c_fill",
    xlarge: "w_1400,h_1050,c_fill",
  },

  // Quality presets by use case
  qualityPresets: {
    hero: 65, // High quality for main visuals
    gallery: 60, // Balanced for gallery viewing
    thumbnail: 70, // Sharp for small previews
    modal: 65, // Optimized for large viewing
    card: 65, // Clean for card layouts
    logo: 90, // Crisp for branding
  },

  // Performance settings
  performance: {
    defaultFormat: "avif",
    fallbackFormat: "webp",
    enableProgressive: true,
    enableLossless: false,
    compressionLevel: "auto",
    fetchPriority: {
      hero: "high",
      gallery: "low",
      thumbnail: "low",
    },
  },

  // Caching strategy
  cache: {
    maxAge: 31536000, // 1 year
    staleWhileRevalidate: 86400, // 24 hours
    maxEntries: 500,
  },
};

/**
 * Image Cache Manager
 */
class ImageCacheManager {
  constructor() {
    this.cache = new Map();
    this.accessTimes = new Map();
  }

  get(key) {
    if (this.cache.has(key)) {
      this.accessTimes.set(key, Date.now());
      return this.cache.get(key);
    }
    return null;
  }

  set(key, value) {
    // Implement LRU eviction
    if (this.cache.size >= IMAGE_CONFIG.cache.maxEntries) {
      const oldestKey = [...this.accessTimes.entries()].sort(
        ([, a], [, b]) => a - b,
      )[0][0];

      this.cache.delete(oldestKey);
      this.accessTimes.delete(oldestKey);
    }

    this.cache.set(key, value);
    this.accessTimes.set(key, Date.now());
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
    this.accessTimes.clear();
  }

  size() {
    return this.cache.size;
  }
}

/**
 * Main ImageService Class - Enterprise Grade
 */
class ImageService {
  constructor() {
    this.cache = new ImageCacheManager();
    this.processingQueue = new Map();
    this.performanceMetrics = {
      processed: 0,
      cacheHits: 0,
      errors: 0,
    };
  }

  /**
   * Main processing method - handles all image transformations
   */
  processImage(imageData, variant = "gallery", options = {}) {
    // Validation
    if (!imageData?.url) {
      console.warn("ImageService: No image URL provided");
      return this.getPlaceholderUrl(variant);
    }

    // Handle already processed images
    if (imageData.isProcessed && imageData.processedUrls?.[variant]) {
      return imageData.processedUrls[variant];
    }

    // Generate cache key
    const cacheKey = this.generateCacheKey(imageData, variant, options);

    // Check cache first
    if (this.cache.has(cacheKey)) {
      this.performanceMetrics.cacheHits++;
      return this.cache.get(cacheKey);
    }

    // Process image
    const processedUrl = this.generateCloudinaryUrl(
      imageData,
      variant,
      options,
    );

    // Cache result
    this.cache.set(cacheKey, processedUrl);
    this.performanceMetrics.processed++;

    return processedUrl;
  }

  /**
   * Generates Cloudinary URL with all transformations - FIXED VERSION
   */
  generateCloudinaryUrl(imageData, variant, options = {}) {
    const config = {
      quality: this.getQualityForVariant(variant),
      format: IMAGE_CONFIG.performance.defaultFormat,
      progressive: IMAGE_CONFIG.performance.enableProgressive,
      ...options,
    };

    // Get transformation parameters
    const transformation = this.getTransformation(variant);
    const qualityParam = `,q_${config.quality}`;
    const formatParam = `,f_${config.format}`;

    // Progressive loading
    const progressiveParam = config.progressive ? ",fl_progressive" : "";

    // Construct final URL - NO fl_attachment for fetch URLs
    const baseUrl = `https://res.cloudinary.com/${IMAGE_CONFIG.cloudName}/image/fetch`;
    const transformations = `${transformation}${qualityParam}${formatParam}${progressiveParam}`;
    const sourceUrl = encodeURIComponent(imageData.url);

    return `${baseUrl}/${transformations}/${sourceUrl}`;
  }

  /**
   * Gets transformation parameters for variant
   */
  getTransformation(variant) {
    return IMAGE_CONFIG.variants[variant] || IMAGE_CONFIG.variants.gallery;
  }

  /**
   * Gets optimal quality for variant
   */
  getQualityForVariant(variant) {
    // Map variants to quality presets
    const qualityMap = {
      heroDesktop: IMAGE_CONFIG.qualityPresets.hero,
      heroTablet: IMAGE_CONFIG.qualityPresets.hero,
      heroMobile: IMAGE_CONFIG.qualityPresets.hero,
      hero4K: IMAGE_CONFIG.qualityPresets.hero,
      roomCard: IMAGE_CONFIG.qualityPresets.card,
      roomCardHome: IMAGE_CONFIG.qualityPresets.card,
      serviceCard: IMAGE_CONFIG.qualityPresets.card,
      gallery: IMAGE_CONFIG.qualityPresets.gallery,
      galleryLarge: IMAGE_CONFIG.qualityPresets.gallery,
      thumbnail: IMAGE_CONFIG.qualityPresets.thumbnail,
      modal: IMAGE_CONFIG.qualityPresets.modal,
      modalFallback: IMAGE_CONFIG.qualityPresets.modal,
      logo: IMAGE_CONFIG.qualityPresets.logo,
      logoSmall: IMAGE_CONFIG.qualityPresets.logo,
    };

    return qualityMap[variant] || IMAGE_CONFIG.qualityPresets.gallery;
  }

  /**
   * Generates cache key for deduplication
   */
  generateCacheKey(imageData, variant, options) {
    const keyParts = [
      imageData.url,
      variant,
      options.quality || "auto",
      options.format || IMAGE_CONFIG.performance.defaultFormat,
    ];

    return keyParts.join("|");
  }

  /**
   * Returns placeholder URL for missing images
   */
  getPlaceholderUrl(variant = "gallery") {
    const transformation = this.getTransformation(variant);
    return `https://res.cloudinary.com/${IMAGE_CONFIG.cloudName}/image/upload/${transformation},q_60,f_avif/v1/placeholders/limban-resort-placeholder.jpg`;
  }

  /**
   * Batch processing for multiple images
   */
  processImageBatch(images, variant = "gallery", options = {}) {
    if (!Array.isArray(images)) {
      console.warn("ImageService.processImageBatch: Expected array of images");
      return [];
    }

    return images
      .map((imageData, index) => {
        if (!imageData) return null;

        // Add batch context
        const enhancedOptions = {
          ...options,
          batchIndex: index,
          batchSize: images.length,
        };

        return this.processImage(imageData, variant, enhancedOptions);
      })
      .filter(Boolean);
  }

  /**
   * Gallery-specific processing with consistent context
   */
  processGalleryImages(images, galleryType = "general", options = {}) {
    if (!Array.isArray(images)) return [];

    return images
      .map((imageData, index) => {
        if (!imageData) return null;

        // Ensure gallery context is set
        const enhancedImageData = {
          ...imageData,
          context: {
            ...imageData.context,
            galleryType,
            galleryIndex: index,
          },
        };

        return {
          // Original image data
          ...enhancedImageData,

          // Processed URLs for different use cases
          processedUrls: {
            thumbnail: this.processImage(enhancedImageData, "thumbnail"),
            gallery: this.processImage(enhancedImageData, "gallery"),
            large: this.processImage(enhancedImageData, "galleryLarge"),
            modal: this.processImage(enhancedImageData, "modal"),
          },

          // Gallery-specific metadata
          galleryMeta: {
            type: galleryType,
            index,
            total: images.length,
            isFirst: index === 0,
            isLast: index === images.length - 1,
          },
        };
      })
      .filter(Boolean);
  }

  /**
   * Performance and debugging
   */
  getMetrics() {
    return {
      ...this.performanceMetrics,
      cacheSize: this.cache.size(),
      hitRate:
        this.performanceMetrics.cacheHits /
        Math.max(1, this.performanceMetrics.processed),
    };
  }

  clearCache() {
    this.cache.clear();
    console.log("ImageService: Cache cleared");
  }

  /**
   * Responsive image processing for different breakpoints
   */
  processResponsiveImage(imageData, options = {}) {
    const breakpoints = {
      mobile: "heroMobile",
      tablet: "heroTablet",
      desktop: "heroDesktop",
      xl: "hero4K",
    };

    const responsiveUrls = {};

    Object.entries(breakpoints).forEach(([breakpoint, variant]) => {
      responsiveUrls[breakpoint] = this.processImage(
        imageData,
        variant,
        options,
      );
    });

    return responsiveUrls;
  }
}

// Create singleton instance
const imageService = new ImageService();

// Export main interface
export default imageService;

// Export convenience functions for backward compatibility and ease of use
export const processImage = (imageData, variant, options) =>
  imageService.processImage(imageData, variant, options);

export const processImageBatch = (images, variant, options) =>
  imageService.processImageBatch(images, variant, options);

export const processGalleryImages = (images, galleryType, options) =>
  imageService.processGalleryImages(images, galleryType, options);

export const processResponsiveImage = (imageData, options) =>
  imageService.processResponsiveImage(imageData, options);

// Legacy compatibility (for any existing getCloudinaryUrl calls)
export const getCloudinaryUrl = (url, variant = "gallery", options = {}) => {
  const imageData = { url, context: { pageType: "legacy" } };
  return imageService.processImage(imageData, variant, options);
};

// Performance monitoring
if (typeof window !== "undefined") {
  window.ImageServiceMetrics = () => imageService.getMetrics();
}
