import { getImage } from 'astro:assets';

/**
 * Process any image structure from Hygraph into fully optimized gallery format
 */
export async function processGalleryImage(item, index = 0) {
  try {
    // Handle different Hygraph structures
    const imageObj = item.image || item;
    const sourceUrl = imageObj.large || imageObj.thumb400 || imageObj.url;
    
    if (!sourceUrl) {
      throw new Error(`No URL found for image ${index}`);
    }

    // 🎯 ADD inferSize: true TO ALL getImage CALLS
    const [optimizedThumbnail, optimizedMedium, optimizedLarge] = await Promise.all([
      // Thumbnail: 96x96 for gallery navigation
      getImage({
        src: sourceUrl,
        width: 96,
        height: 96,
        format: 'webp',
        quality: 60,
        fit: 'cover',
        inferSize: true, // 🎯 FIX: Let Astro get dimensions from source
      }),
      
      // Medium: 800x800 for fallback/mobile
      getImage({
        src: sourceUrl,
        width: 300,
        height: 300,
        format: 'webp',
        quality: 60,
        fit: 'cover',
        inferSize: true, // 🎯 FIX
      }),
      
      // Large: 1600px wide for desktop gallery modal
      getImage({
        src: sourceUrl,
        width: 1600,
        format: 'webp',
        quality: 80,
        fit: 'inside',
        inferSize: true, // 🎯 FIX
      })
    ]);

    return {
      src: optimizedLarge.src,
      gallerythumbs: optimizedThumbnail.src,
      medium: optimizedMedium.src,
      placeholder: imageObj.placeholder || sourceUrl,
      alt: item.caption || item.altText || item.alt || `Gallery image ${index + 1}`,
      width: optimizedLarge.width,
      height: optimizedLarge.height,
    };
  } catch (error) {
    console.error(`Failed to process image ${index}:`, error);
    
    // Fallback to original Hygraph URLs
    const imageObj = item.image || item;
    return {
      src: imageObj.large || imageObj.grid || imageObj.url,
      gallerythumbs: imageObj.gallerythumbs || imageObj.grid || imageObj.url,
      medium: imageObj.thumb400 || imageObj.grid || imageObj.url,
      placeholder: imageObj.placeholder || imageObj.url,
      alt: item.caption || item.altText || item.alt || `Gallery image ${index + 1}`,
      width: imageObj.width || 300,
      height: imageObj.height || 300,
    };
  }
}

/**
 * Process an array of gallery items
 */
export async function processGalleryImages(items) {
  if (!items?.length) return [];
  
  const processed = await Promise.all(
    items.map((item, index) => processGalleryImage(item, index))
  );
  
  return processed;
}
