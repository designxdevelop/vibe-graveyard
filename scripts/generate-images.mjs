import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

// Colors
const BLACK = '#0a0a0a'
const GREEN = '#00ff00'
const GREEN_DIM = '#004400'
const GRAY = '#666666'
const GRAY_DARK = '#333333'
const GRASS = '#1a4d1a'
const DIRT = '#3d2817'

// Create a 32x32 favicon
async function generateFavicon() {
  const size = 32
  
  // Create pixel data for a gravestone
  const pixels = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let color = BLACK
      
      // Gravestone body
      if (x >= 8 && x < 24 && y >= 10 && y < 28) color = GRAY
      if (x >= 10 && x < 22 && y >= 8 && y < 12) color = GRAY
      if (x >= 12 && x < 20 && y >= 6 && y < 10) color = GRAY
      
      // Shadow
      if (x >= 8 && x < 24 && y >= 26 && y < 28) color = GRAY_DARK
      if (x >= 22 && x < 24 && y >= 10 && y < 28) color = GRAY_DARK
      
      // Cross on top
      if (x >= 14 && x < 18 && y >= 2 && y < 4) color = GREEN
      if (x >= 15 && x < 17 && y >= 1 && y < 5) color = GREEN
      
      // RIP text area (simplified)
      if (y >= 13 && y < 17) {
        // R
        if ((x === 11 || x === 12) && y >= 13 && y < 17) color = GREEN
        if (x === 13 && (y === 13 || y === 15)) color = GREEN
        // I
        if (x === 15 && y >= 13 && y < 17) color = GREEN
        // P
        if ((x === 17 || x === 18) && y >= 13 && y < 17) color = GREEN
        if (x === 19 && (y === 13 || y === 14)) color = GREEN
      }
      
      // Ground
      if (y >= 28) color = GRASS
      if (x >= 6 && x < 8 && y === 27) color = GRASS
      if (x >= 12 && x < 14 && y === 27) color = GRASS
      if (x >= 20 && x < 22 && y === 27) color = GRASS
      
      const r = parseInt(color.slice(1, 3), 16)
      const g = parseInt(color.slice(3, 5), 16)
      const b = parseInt(color.slice(5, 7), 16)
      pixels.push(r, g, b, 255)
    }
  }
  
  const buffer = Buffer.from(pixels)
  
  await sharp(buffer, {
    raw: {
      width: size,
      height: size,
      channels: 4
    }
  })
    .png()
    .toFile(join(publicDir, 'favicon.png'))
  
  // Also create ICO-compatible version (just a 32x32 PNG works for most browsers)
  await sharp(buffer, {
    raw: {
      width: size,
      height: size,
      channels: 4
    }
  })
    .png()
    .toFile(join(publicDir, 'favicon.ico'))
    
  console.log('Generated favicon.png and favicon.ico')
}

// Create 1200x630 OG image
async function generateOGImage() {
  const width = 1200
  const height = 630
  
  // Create SVG with embedded styles (more reliable than raw pixels for complex image)
  const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&amp;display=swap');
      .title { font-family: 'Press Start 2P', monospace; font-size: 48px; fill: #00ff00; }
      .subtitle { font-family: 'Press Start 2P', monospace; font-size: 18px; fill: #004400; }
      .tagline { font-family: 'Press Start 2P', monospace; font-size: 14px; fill: #00ff00; opacity: 0.7; }
    </style>
    <pattern id="scanlines" patternUnits="userSpaceOnUse" width="4" height="4">
      <rect width="4" height="2" fill="rgba(0,0,0,0.1)"/>
    </pattern>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="#0a0a0a"/>
  
  <!-- Stars -->
  <circle cx="100" cy="80" r="2" fill="#00ff00" opacity="0.5"/>
  <circle cx="250" cy="120" r="2" fill="#00ff00" opacity="0.7"/>
  <circle cx="400" cy="60" r="2" fill="#00ff00" opacity="0.4"/>
  <circle cx="550" cy="100" r="2" fill="#00ff00" opacity="0.6"/>
  <circle cx="700" cy="50" r="2" fill="#00ff00" opacity="0.5"/>
  <circle cx="850" cy="90" r="2" fill="#00ff00" opacity="0.8"/>
  <circle cx="1000" cy="70" r="2" fill="#00ff00" opacity="0.4"/>
  <circle cx="1100" cy="110" r="2" fill="#00ff00" opacity="0.6"/>
  
  <!-- Moon -->
  <circle cx="1050" cy="100" r="50" fill="#004400"/>
  <circle cx="1040" cy="90" r="50" fill="#0a0a0a"/>
  
  <!-- Ground -->
  <rect x="0" y="530" width="${width}" height="100" fill="#1a4d1a"/>
  <rect x="0" y="520" width="${width}" height="15" fill="#3d2817"/>
  
  <!-- Left gravestone -->
  <rect x="150" y="350" width="120" height="170" fill="#666666"/>
  <rect x="160" y="320" width="100" height="40" fill="#666666"/>
  <rect x="180" y="300" width="60" height="30" fill="#666666"/>
  <rect x="150" y="510" width="120" height="10" fill="#333333"/>
  <rect x="260" y="350" width="10" height="170" fill="#333333"/>
  
  <!-- Center gravestone -->
  <rect x="480" y="300" width="160" height="220" fill="#666666"/>
  <rect x="500" y="260" width="120" height="50" fill="#666666"/>
  <rect x="530" y="230" width="60" height="40" fill="#666666"/>
  <rect x="480" y="510" width="160" height="10" fill="#333333"/>
  <rect x="630" y="300" width="10" height="220" fill="#333333"/>
  <!-- Cross -->
  <rect x="545" y="200" width="30" height="8" fill="#00ff00"/>
  <rect x="555" y="192" width="10" height="24" fill="#00ff00"/>
  
  <!-- Right gravestone -->
  <rect x="880" y="380" width="100" height="140" fill="#666666"/>
  <rect x="890" y="355" width="80" height="30" fill="#666666"/>
  <rect x="880" y="510" width="100" height="10" fill="#333333"/>
  <rect x="970" y="380" width="10" height="140" fill="#333333"/>
  <!-- Crack -->
  <rect x="910" y="400" width="3" height="20" fill="#333333"/>
  <rect x="913" y="415" width="3" height="25" fill="#333333"/>
  <rect x="910" y="435" width="3" height="35" fill="#333333"/>
  
  <!-- Text -->
  <text x="600" y="340" text-anchor="middle" class="title">VIBE GRAVEYARD</text>
  <text x="600" y="390" text-anchor="middle" class="subtitle">WHERE ABANDONED PROJECTS REST IN PEACE</text>
  <text x="600" y="460" text-anchor="middle" class="tagline">PRESS F TO PAY RESPECTS</text>
  
  <!-- Scanlines -->
  <rect width="${width}" height="${height}" fill="url(#scanlines)"/>
</svg>`

  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(publicDir, 'og-image.png'))
    
  console.log('Generated og-image.png')
}

// Run generation
async function main() {
  try {
    await generateFavicon()
    await generateOGImage()
    console.log('All images generated successfully!')
  } catch (err) {
    console.error('Error generating images:', err)
    process.exit(1)
  }
}

main()
