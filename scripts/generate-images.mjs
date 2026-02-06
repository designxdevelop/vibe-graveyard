import sharp from 'sharp'
import { readFileSync } from 'fs'
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
  const svgPath = join(publicDir, 'og-image.svg')
  const svg = readFileSync(svgPath)

  await sharp(svg)
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
