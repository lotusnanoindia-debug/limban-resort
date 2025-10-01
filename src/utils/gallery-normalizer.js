/**
 * Universal Gallery Data Normalizer
 * Converts ANY Hygraph gallery data into consistent format
 * Works with your existing ImageService.js (unchanged)
 */

import imageService from "./ImageService.js";

/**
 * Detects Hygraph gallery data structure and normalizes it
 */
export function normalizeGalleryData(
  rawImages,
  galleryType = "general",
  options = {},
) {
  if (!Array.isArray(rawImages) || rawImages.length === 0) {
    return [];
  }

  return rawImages
    .map((item, index) => {
      // Smart detection of image data structure
      const imageData = extractImageData(item, index);
      const altText = extractAltText(item, galleryType, index);

      return {
        id: imageData.id || `${galleryType}-${index}`,
        alt: altText,
        width: imageData.width,
        height: imageData.height,

        // Processed URLs using your existing ImageService
        processedUrls: {
          thumbnail: imageService.processImage(imageData, "galleryThumbnail"),
          gallery: imageService.processImage(imageData, "gallery"),
          large: imageService.processImage(imageData, "galleryLarge"),
          modal: imageService.processImage(imageData, "modal"),
        },

        // Modal-compatible format (what your existing modal expects)
        src: imageService.processImage(imageData, "modal"),
        medium: imageService.processImage(imageData, "gallery"),
        thumbnail: imageService.processImage(imageData, "galleryThumbnail"),
      };
    })
    .filter(Boolean);
}

/**
 * Smart image data extraction - handles all Hygraph structures
 */
function extractImageData(item, index) {
  // Direct Asset (teamImages, safariImages, etc.)
  if (item.url && item.id) {
    return item;
  }

  // Nested image object (vibeGallery.images, room.gallery, etc.)
  if (item.image && item.image.url) {
    return item.image;
  }

  // Fallback for unknown structures
  console.warn(`Unknown gallery item structure at index ${index}:`, item);
  return item.image || item || {};
}

/**
 * Smart alt text extraction with gallery-specific logic
 */
function extractAltText(item, galleryType, index) {
  // Priority order: alt, altText, caption, generated
  const candidates = [
    item.alt,
    item.altText,
    item.caption,
    item.image?.alt,
    item.image?.altText,
  ];

  const foundText = candidates.find((text) => text && typeof text === "string");

  if (foundText) {
    return foundText;
  }

  // Generate contextual alt text
  const typeMap = {
    vibe: "Limban Experience",
    guest: "Limban Guest Moments",
    team: "Limban Team Member",
    rooms: "Limban Room View",
    wildlife: "Limban Wildlife",
    dining: "Limban Dining Experience",
    corporate: "Limban Corporate Events",
    safari: "Limban Safari Experience",
  };

  return `${typeMap[galleryType] || "Image"} ${index + 1}`;
}

/**
 * Convenience function for common gallery processing
 */
export function processGalleryForModal(rawImages, galleryType) {
  return normalizeGalleryData(rawImages, galleryType).map((item) => ({
    id: item.id,
    src: item.src,
    medium: item.medium,
    thumbnail: item.thumbnail,
    alt: item.alt,
    index: parseInt(item.id.split("-")[1]) || 0,
  }));
}
