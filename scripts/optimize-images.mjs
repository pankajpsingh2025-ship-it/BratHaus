// Resize generated PNGs in raw/ to 900w/1600w WebP and a 1600w JPEG fallback in public/work/.
import sharp from 'sharp'
import { existsSync, mkdirSync } from 'node:fs'

const MAP = {
  'p1-hero': 'soft-machinery-hero', 'p1-detail': 'soft-machinery-detail',
  'p2-hero': 'margin-hero', 'p2-detail': 'margin-detail',
  'p3-hero': 'thresholds-hero', 'p3-detail': 'thresholds-detail',
}
mkdirSync('public/work', { recursive: true })
for (const [src, dst] of Object.entries(MAP)) {
  const file = `raw/${src}.png`
  if (!existsSync(file)) continue
  const img = sharp(file)
  const { width, height } = await img.metadata()
  for (const w of [900, 1600]) await sharp(file).resize({ width: Math.min(w, width) }).webp({ quality: 74, effort: 5 }).toFile(`public/work/${dst}-${w}.webp`)
  await sharp(file).resize({ width: Math.min(1600, width) }).jpeg({ quality: 72, mozjpeg: true, progressive: true }).toFile(`public/work/${dst}-1600.jpg`)
  console.log(dst, width, height)
}
