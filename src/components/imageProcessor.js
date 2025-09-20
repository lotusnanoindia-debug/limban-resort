import { getImage } from "astro:assets";

// 🎯 ENHANCED: Process images in batches to prevent build bottlenecks
export async function processImagesInBatches(images, batchSize = 4) {
  const results = [];
  
  for (let i = 0; i < images.length; i += batchSize) {
    const batch = images.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1}: ${batch.length} images`);
    
    const batchResults = await Promise.all(
      batch.map((item, index) => processGalleryImage(item, i + index))
    );
    
    results.push(...batchResults);
    
    if (i + batchSize < images.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

// 🎯 ENHANCED: Hero mosaic optimizer with LQIP generation  
export async function optimizeHeroTile(url) {
  if (!url) return null;
  try {
    const [optimized, placeholder] = await Promise.all([
      getImage({
        src: url,
        width: 300,
        height: 400,
        format: "avif",
        quality: 60,
        fit: "cover",
        inferSize: true,
      }),
      getImage({
        src: url,
        width: 20,
        height: 26,
        format: "avif",
        quality: 20,
        fit: "cover",
        inferSize: true,
      })
    ]);

    return {
      ...optimized,
      placeholder: placeholder.src
    };
  } catch (error) {
    console.error("Failed to optimize hero tile:", error);
    return null;
  }
}

// 🎯 ENHANCED: Gallery image processor with LQIP
export async function processGalleryImage(item, index = 0) {
  try {
    const imageObj = item.image || item;
    const sourceUrl = imageObj.large || imageObj.grid || imageObj.url;
    
    if (!sourceUrl) {
      throw new Error(`No URL found for image ${index}`);
    }

    const [optimizedThumbnail, optimizedMedium, optimizedLarge, lqip] = await Promise.all([
      getImage({
        src: sourceUrl,
        width: 96,
        height: 96,
        format: 'avif',
        quality: 60,
        fit: 'cover',
        inferSize: true,
      }),
      getImage({
        src: sourceUrl,
        width: 300,
        height: 300,
        format: 'avif',
        quality: 60,
        fit: 'cover',
        inferSize: true,
      }),
      getImage({
        src: sourceUrl,
        width: 1600,
        format: 'avif',
        quality: 80,
        fit: 'inside',
        inferSize: true,
      }),
      getImage({
        src: sourceUrl,
        width: 24,
        height: 24,
        format: 'avif',
        quality: 20,
        fit: 'cover',
        inferSize: true,
      })
    ]);

    return {
      src: optimizedLarge.src,
      gallerythumbs: optimizedThumbnail.src,
      medium: optimizedMedium.src,
      placeholder: lqip.src,
      alt: `${item.caption || item.altText || 'Luxury safari experience'} - Premium wildlife resort accommodation at Limban Resort Tadoba National Park Maharashtra`,
      width: optimizedLarge.width,
      height: optimizedLarge.height,
    };
  } catch (error) {
    console.error(`Failed to process image ${index}:`, error);
    
    const imageObj = item.image || item;
    return {
      src: imageObj.large || imageObj.grid || imageObj.url,
      gallerythumbs: imageObj.gallerythumbs || imageObj.grid || imageObj.url,
      medium: imageObj.thumb400 || imageObj.grid || imageObj.url,
      placeholder: imageObj.placeholder || imageObj.url,
      alt: `${item.caption || item.altText || 'Luxury safari experience'} - Premium wildlife resort accommodation at Limban Resort Tadoba National Park Maharashtra ${index + 1}`,
      width: imageObj.width || 300,
      height: imageObj.height || 300,
    };
  }
}

// 🎯 NEW: Single image optimizer for hero/room/experience images
export async function optimizeSingleImage(url, width, height, quality = 80) {
  if (!url) return null;
  try {
    const [optimized, placeholder] = await Promise.all([
      getImage({
        src: url,
        width: width,
        height: height,
        format: "avif",
        quality: quality,
        fit: "cover",
        inferSize: true,
      }),
      getImage({
        src: url,
        width: Math.floor(width / 15),
        height: Math.floor(height / 15),
        format: "avif",
        quality: 20,
        fit: "cover",
        inferSize: true,
      })
    ]);

    return {
      ...optimized,
      lqip: placeholder.src
    };
  } catch (error) {
    console.error("Failed to optimize single image:", error);
    return { src: url, lqip: null };
  }
}

// Backwards compatibility
export { processGalleryImage as processGalleryImages };
