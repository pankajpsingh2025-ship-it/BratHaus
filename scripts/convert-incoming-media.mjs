// Converts the owner's media in incoming/ (never modified) into public/, following a name map
// (source file → public path). Images: WebP, longest side 2400px (square tiles 1400px), quality 82,
// never enlarged. Videos: H.264 MP4, 1280px wide, CRF 26 (raised step by step until under 4 MB),
// no audio, +faststart, plus a JPEG poster of the first frame.
// Usage: node scripts/convert-incoming-media.mjs <map.json>
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const map = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const out = (p) => { const f = path.join("public", p); fs.mkdirSync(path.dirname(f), { recursive: true }); return f; };
const kb = (f) => Math.round(fs.statSync(f).size / 1024);

for (const [src, dest] of Object.entries(map.images ?? {})) {
  const file = path.join("incoming/images", src);
  const meta = await sharp(file).metadata();
  const square = Math.abs(meta.width - meta.height) / Math.max(meta.width, meta.height) < 0.02;
  const max = square ? 1400 : 2400;
  const target = out(dest);
  await sharp(file).rotate().resize({ width: max, height: max, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toFile(target);
  const m = await sharp(target).metadata();
  console.log(`image  ${dest}  ${m.width}x${m.height}  ${kb(target)} KB  ← ${src}`);
}

for (const [src, dest] of Object.entries(map.videos ?? {})) {
  const file = path.join("incoming/video", src);
  const target = out(dest);
  for (const crf of [26, 28, 30, 32]) {
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", file, "-vf", "scale=1280:-2", "-c:v", "libx264", "-preset", "slow", "-crf", String(crf), "-pix_fmt", "yuv420p", "-profile:v", "high", "-an", "-movflags", "+faststart", target]);
    if (fs.statSync(target).size < 4 * 1024 * 1024) { console.log(`video  ${dest}  crf ${crf}  ${kb(target)} KB  ← ${src}`); break; }
    if (crf === 32) console.log(`video  ${dest}  crf ${crf}  ${kb(target)} KB (over 4 MB)  ← ${src}`);
  }
  const poster = target.replace(/\.mp4$/, ".jpg");
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", target, "-frames:v", "1", "-q:v", "3", poster]);
  console.log(`poster ${path.relative("public", poster)}  ${kb(poster)} KB`);
}
