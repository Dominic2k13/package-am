/**
 * Generates PWA icons for Package-Am using sharp.
 * Run once: node scripts/generate-icons.mjs
 */
import sharp from 'sharp'
import { writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'public', 'icons')

// Brand orange gradient SVG icon
function makeSvg(size) {
  const r = Math.round(size * 0.18)   // border-radius
  const pad = Math.round(size * 0.18) // inner padding
  const inner = size - pad * 2
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FF5A1F"/>
      <stop offset="100%" stop-color="#D94510"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#bg)"/>
  <!-- Package box body -->
  <g transform="translate(${pad}, ${pad})">
    <!-- Box bottom half -->
    <rect x="${inner*0.1}" y="${inner*0.42}" width="${inner*0.8}" height="${inner*0.46}"
          rx="${inner*0.06}" fill="white" opacity="0.95"/>
    <!-- Box top lid -->
    <rect x="${inner*0.05}" y="${inner*0.28}" width="${inner*0.9}" height="${inner*0.18}"
          rx="${inner*0.05}" fill="white" opacity="0.85"/>
    <!-- Ribbon horizontal -->
    <rect x="${inner*0.1}" y="${inner*0.28}" width="${inner*0.8}" height="${inner*0.18}"
          rx="0" fill="white" opacity="0.0"/>
    <!-- Vertical ribbon strip -->
    <rect x="${inner*0.44}" y="${inner*0.28}" width="${inner*0.12}" height="${inner*0.62}"
          fill="#FF5A1F" opacity="0.5" rx="${inner*0.02}"/>
    <!-- Bow top-left -->
    <ellipse cx="${inner*0.36}" cy="${inner*0.24}" rx="${inner*0.1}" ry="${inner*0.07}"
             fill="white" opacity="0.9" transform="rotate(-30 ${inner*0.36} ${inner*0.24})"/>
    <!-- Bow top-right -->
    <ellipse cx="${inner*0.64}" cy="${inner*0.24}" rx="${inner*0.1}" ry="${inner*0.07}"
             fill="white" opacity="0.9" transform="rotate(30 ${inner*0.64} ${inner*0.24})"/>
    <!-- Bow centre -->
    <circle cx="${inner*0.5}" cy="${inner*0.26}" r="${inner*0.05}" fill="white" opacity="0.95"/>
  </g>
</svg>`.trim()
}

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

async function main() {
  for (const size of SIZES) {
    const svg = Buffer.from(makeSvg(size))
    await sharp(svg)
      .png()
      .toFile(path.join(OUT, `icon-${size}x${size}.png`))
    console.log(`✓ icon-${size}x${size}.png`)
  }

  // Apple touch icon (180x180)
  const applesvg = Buffer.from(makeSvg(180))
  await sharp(applesvg).png().toFile(path.join(OUT, 'apple-touch-icon.png'))
  console.log('✓ apple-touch-icon.png')

  // Favicon 32x32
  const favsvg = Buffer.from(makeSvg(32))
  const favBuf = await sharp(favsvg).png().toBuffer()
  writeFileSync(path.join(OUT, '..', 'favicon.png'), favBuf)
  console.log('✓ favicon.png')

  console.log('\nAll icons generated in public/icons/')
}

main().catch(err => { console.error(err); process.exit(1) })
