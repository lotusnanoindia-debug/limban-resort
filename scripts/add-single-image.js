import sharp from 'sharp';
import fs from 'fs';
import crypto from 'crypto';

// The missing SubHero image
const MISSING_URL = 'https://ap-south-1.graphassets.com/cmek3o6f00dcb07o59sno2s0e/cmfgb57ea0hlb08o2jlpz4w6y';

// All transformations
const TRANSFORMATIONS = {
  'placeholder': { width: 20, height: 20, quality: 20 },
  'gallerythumbs': { width: 92, height: 92, quality: 60 },
  'grid': { width: 300, height: 300, quality: 35 },
  'thumb400': { width: 400, height: 400, quality: 35 },
  'large': { width: 1200, height: null, quality: 70 },
  'heroMobile': { width: 768, height: 432, quality: 85 },
  'heroTablet': { width: 1024, height: 576, quality: 80 },
  'heroDesktop': { width: 1600, height: 900, quality: 75 },
  'hero4K': { width: 2560, height: 1440, quality: 70 },
  'optimisedCard': { width: 600, height: 400, quality: 60 },
  'optimisedWide': { width: 1200, height: 800, quality: 60 },
  'optimisedPortrait': { width: 1000, height: 1000, quality: 60 },
  'optimisedSquare': { width: 400, height: 400, quality: 60 },
  'micro': { width: 40, height: 40, quality: 25 },
  'optimised': { width: 120, height: 120, quality: 35 },
  'optimisedLogo': { width: 80, height: 80, quality: 70 }
};

function urlToHash(url) {
  return crypto.createHash('md5').update(url).digest('hex').substring(0, 12);
}

async function addSingleImage() {
  console.log('⚡ Adding single missing SubHero image...');
  
  // Load existing mapping
  let mapping = {};
  try {
    const existing = fs.readFileSync('public/image-mapping.json', 'utf8');
    mapping = JSON.parse(existing);
  } catch (error) {
    console.error('Failed to load existing mapping');
    return;
  }
  
  const imageHash = urlToHash(MISSING_URL);
  console.log(`📥 Processing: ${MISSING_URL}`);
  console.log(`🔑 Hash: ${imageHash}`);
  
  // Download image
  const response = await fetch(MISSING_URL);
  const buffer = Buffer.from(await response.arrayBuffer());
  
  // Process all sizes
  mapping[MISSING_URL] = {};
  
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
      mapping[MISSING_URL][transformName] = `/optimized/${filename}`;
      
      console.log(`  ✅ ${transformName}`);
    } catch (error) {
      console.log(`  ❌ ${transformName}: ${error.message}`);
      mapping[MISSING_URL][transformName] = MISSING_URL;
    }
  }
  
  // Save updated mapping
  fs.writeFileSync('public/image-mapping.json', JSON.stringify(mapping, null, 2));
  console.log('🎉 SubHero image added to mapping!');
}

addSingleImage().catch(console.error);
