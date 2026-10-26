// Section 12: crop each hero still to 16:9 around the centre, 2400px wide, WebP q84 → public/work/<slug>-hero.webp
import sharp from "sharp";
import { existsSync } from "node:fs";
const MAP = { "wren-ashby": "incoming/gemini/higgsfield-wren-ashby.png", mereway: "incoming/gemini/higgsfield-mereway.png", oakmere: "incoming/gemini/higgsfield-oakmere.png" };
for (const [slug, src] of Object.entries(MAP)) {
  if (!existsSync(src)) { console.log(`skip ${slug}: ${src} missing`); continue; }
  const { width, height } = await sharp(src).metadata();
  const w = Math.min(width, Math.round(height * 16 / 9)), h = Math.round(w * 9 / 16);
  await sharp(src).extract({ left: Math.round((width - w) / 2), top: Math.round((height - h) / 2), width: w, height: h })
    .resize({ width: 2400, withoutEnlargement: false }).webp({ quality: 84 }).toFile(`public/work/${slug}-hero.webp`);
  console.log(`${slug}: public/work/${slug}-hero.webp`);
}
