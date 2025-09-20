import sharp from 'sharp';
import fs from 'fs';
import crypto from 'crypto';

const HYGRAPH_URL = 'https://ap-south-1.cdn.hygraph.com/content/cmek3o66w01vb07w64qwgkybp/master';


const GET_ALL_ORIGINAL_IMAGES_QUERY = `
  query GetAllOriginalImages {
    heroSlides(where: { active: true }) {
      backgroundImage { url }
    }
    subHeroSections {
      image { url }
    }
    rooms(first: 100) {
      heroImage { url }
      gallery(first: 100) {
        ... on RoomGalleryItem {
          image { url }
        }
      }
    }
    experienceSections {
      experience {
        image { url }
      }
    }
    vibeGallery(where: {id: "cmf0lo9eja9wk07pcwlzw8zdh"}) {
      images(first: 100) {
        image { url }
      }
    }
    wildlifeGallery(where: {id: "cmf0ovxesabzv07pcvijule37"}) {
      image(first: 100) {
        ... on WildlifePic {
          image { url }
        }
      }
    }
    restaurants(first: 100) {
      logo { url }
      images(first: 100) { url }
    }
    aboutPage(where: {id: "cmeyayyex8xsc07pc8u9cgfxq"}) {
      heroImage { url }
      philosophyImage { url }
      foundersImage { url }
      teamImages(first: 100) { url }
    }
    guestGalleries(first: 10) {
      images(first: 500) { url }
    }
    corporateGalleries {
      image { url }
    }
  }
`;


// The EXACT transformations your components expect
const TRANSFORMATIONS = {
  // Gallery images (IMAGE_FIELDS_FRAGMENT)
  'placeholder': { width: 20, height: 20, quality: 20 },
  'gallerythumbs': { width: 92, height: 92, quality: 60 },
  'grid': { width: 300, height: 300, quality: 35 },
  'thumb400': { width: 400, height: 400, quality: 35 },
  'large': { width: 1200, height: null, quality: 70 }, // maintain aspect ratio
  
  // Hero images (hero backgroundImage)
  'heroMobile': { width: 768, height: 432, quality: 85 },
  'heroTablet': { width: 1024, height: 576, quality: 80 },
  'heroDesktop': { width: 1600, height: 900, quality: 75 },
  'hero4K': { width: 2560, height: 1440, quality: 70 },
  
  // About page specific sizes
  'optimisedCard': { width: 600, height: 400, quality: 60 },
  'optimisedWide': { width: 1200, height: 800, quality: 60 },
  'optimisedPortrait': { width: 1000, height: 1000, quality: 60 },
  'optimisedSquare': { width: 400, height: 400, quality: 60 },
  
  // Restaurant logos
  'micro': { width: 40, height: 40, quality: 25 },
  'optimised': { width: 120, height: 120, quality: 35 },
  'optimisedLogo': { width: 80, height: 80, quality: 70 }
};

function ensureDirectories() {
  fs.mkdirSync('public/optimized', { recursive: true });
}

function urlToHash(url) {
  return crypto.createHash('md5').update(url).digest('hex').substring(0, 12);
}

async function fetchAllOriginalImages() {
  const response = await fetch(HYGRAPH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: GET_ALL_ORIGINAL_IMAGES_QUERY }),
  });
  
  const result = await response.json();
  if (result.errors) throw new Error('GraphQL query failed');
  
  // Extract all unique URLs
  const urls = new Set();
  
  function extractUrls(obj) {
    if (!obj) return;
    if (typeof obj === 'string' && obj.includes('graphassets.com')) {
      urls.add(obj);
    } else if (typeof obj === 'object') {
      Object.values(obj).forEach(extractUrls);
    }
  }
  
  extractUrls(result.data);
  return Array.from(urls);
}

async function processAllImages() {
  console.log('🚀 Creating complete image mapping...\n');
  
  ensureDirectories();
  
  const originalUrls = await fetchAllOriginalImages();
  console.log(`📊 Found ${originalUrls.length} unique images to process\n`);
  
  const mapping = {};
  let processedCount = 0;
  
  for (const originalUrl of originalUrls) {
    const imageHash = urlToHash(originalUrl);
    mapping[originalUrl] = {};
    
    console.log(`📥 ${processedCount + 1}/${originalUrls.length}: Processing ${originalUrl.split('/').pop()}`);
    
    try {
      // Download original once
      const response = await fetch(originalUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      
      // Generate all transformation sizes
      for (const [transformName, config] of Object.entries(TRANSFORMATIONS)) {
        const filename = `${imageHash}-${transformName}.avif`;
        const outputPath = `public/optimized/${filename}`;
        
        try {
          let sharpInstance = sharp(buffer);
          
          if (config.height) {
            sharpInstance = sharpInstance.resize(config.width, config.height, { fit: 'cover' });
          } else {
            sharpInstance = sharpInstance.resize(config.width);
          }
          
          await sharpInstance.avif({ quality: config.quality }).toFile(outputPath);
          
          // Map to local optimized file
          mapping[originalUrl][transformName] = `/optimized/${filename}`;
          
        } catch (error) {
          console.warn(`    ❌ ${transformName}: ${error.message}`);
          // Fallback to original URL
          mapping[originalUrl][transformName] = originalUrl;
        }
      }
      
      console.log(`    ✅ Generated ${Object.keys(TRANSFORMATIONS).length} sizes`);
      processedCount++;
      
    } catch (error) {
      console.error(`    ❌ Failed to process: ${error.message}`);
      // Create fallback mapping
      Object.keys(TRANSFORMATIONS).forEach(transformName => {
        mapping[originalUrl][transformName] = originalUrl;
      });
    }
  }
  
  // Save mapping
  fs.writeFileSync('public/image-mapping.json', JSON.stringify(mapping, null, 2));
  
  console.log(`\n🎉 Complete! Processed ${processedCount}/${originalUrls.length} images`);
  console.log(`📁 Mapping saved to public/image-mapping.json`);
  console.log(`📈 Your components will now use optimized local AVIF files!`);
}

processAllImages().catch(console.error);
