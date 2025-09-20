// 🎯 IMPROVED: Image optimizer with timeout and retry handling
async function optimizeImage(url, width, height, quality = 85) {
  if (!url) return null;
  
  // Add retry logic for network timeouts on Netlify
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const optimized = await getImage({
        src: url,
        width: width,
        height: height,
        format: "avif",
        quality: quality,
        fit: "cover",
        inferSize: true,
      });
      return optimized;
    } catch (error) {
      console.warn(`Image optimization attempt ${attempt}/3 failed for ${url}:`, error.message);
      
      if (attempt === 3) {
        console.error(`All attempts failed for ${url}, using original URL as fallback`);
        return { src: url }; // Return original Hygraph URL as fallback
      }
      
      // Wait before retry with exponential backoff
      const delay = attempt * 3000; // 3s, 6s delays
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
