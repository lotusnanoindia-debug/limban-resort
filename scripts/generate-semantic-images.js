#!/usr/bin/env node

// 🚀 ULTIMATE IMAGE GENERATOR - No external deps
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 🎯 SEMANTIC VARIANTS - Perfect for each use case
const VARIANTS = {
  'room-card': { width: 400, height: 300, quality: 35 },
  'hero-desktop': { width: 1600, height: 900, quality: 60 },
  'hero-mobile': { width: 768, height: 432, quality: 50 },
  'hero-tablet': { width: 1024, height: 576, quality: 55 },
  'thumb': { width: 120, height: 120, quality: 30 },
  'gallery': { width: 300, height: 300, quality: 40 },
  'service': { width: 350, height: 200, quality: 40 },
  'subhero': { width: 500, height: 400, quality: 45 },
  'logo': { width: 80, height: 80, quality: 70 },
  'placeholder': { width: 20, height: 20, quality: 10 }
};

async function generateSemanticImages() {
  console.log('🚀 Generating semantic images...');
  
  // Load image mapping
  const mappingPath = path.join(process.cwd(), 'public', 'image-mapping.json');
  if (!fs.existsSync(mappingPath)) {
    console.error('❌ No image-mapping.json found');
    return;
  }
  
  const imageMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
  const outputDir = path.join(process.cwd(), 'public', 'optimized');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  let processed = 0;
  const total = Object.keys(imageMapping).length;
  
  for (const [originalUrl, mapping] of Object.entries(imageMapping)) {
    try {
      // Extract filename from URL
      const urlParts = originalUrl.split('/');
      const assetId = urlParts[urlParts.length - 1];
      
      // Download original image
      console.log(`📥 Processing ${assetId}...`);
      const response = await fetch(originalUrl);
      const buffer = await response.arrayBuffer();
      const image = sharp(Buffer.from(buffer));
      
      // Create semantic filename base
      const cleanName = `image-${assetId.slice(0, 8)}`.toLowerCase();
      
      // Generate all variants with semantic names
      for (const [variantName, config] of Object.entries(VARIANTS)) {
        const filename = `${cleanName}-${variantName}.avif`;
        const outputPath = path.join(outputDir, filename);
        
        await image
          .clone()
          .resize(config.width, config.height, { 
            fit: 'cover',
            position: 'center'
          })
          .avif({ 
            quality: config.quality,
            effort: 6
          })
          .toFile(outputPath);
        
        console.log(`✅ Generated ${filename} (${config.quality}% quality)`);
      }
      
      processed++;
      console.log(`📊 Progress: ${processed}/${total}`);
      
    } catch (error) {
      console.error(`❌ Error processing ${originalUrl}:`, error.message);
    }
  }
  
  console.log('🎉 Semantic image generation complete!');
}

generateSemanticImages().catch(console.error);
