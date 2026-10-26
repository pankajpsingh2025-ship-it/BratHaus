import fs from "node:fs";
import path from "node:path";

// Image sizes read straight from the file header (WebP and JPEG), synchronously, at build time.
export function imageSize(publicPath: string): { w: number; h: number } | null {
  const file = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
  if (!fs.existsSync(file)) return null;
  const b = fs.readFileSync(file);
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
    const kind = b.toString("ascii", 12, 16);
    if (kind === "VP8X") return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
    if (kind === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    if (kind === "VP8L") { const n = b.readUInt32LE(21); return { w: 1 + (n & 0x3fff), h: 1 + ((n >> 14) & 0x3fff) }; }
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1], len = b.readUInt16BE(i + 2);
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
      i += 2 + len;
    }
  }
  return null;
}

// Every media slot and its fallback chain: the owner's file first, then null (the designed placeholder).
const has = (p: string) => fs.existsSync(path.join(process.cwd(), "public", p.replace(/^\//, "")));
const first = (...c: string[]) => c.find(has) ?? null;
export const media = {
  has,
  first,
  studioDesk: () => first("/images/studio-desk.webp"),
  founder: () => first("/images/founder.webp"),
  /** a project's hero still: the owner's laptop render, then the first screenshot */
  workHero: (slug: string) => first(`/work/${slug}-hero.webp`, `/work/${slug}-screen-1.webp`),
  workPhone: (slug: string) => first(`/work/${slug}-phone.webp`, `/work/${slug}-mobile-1.webp`),
  /** the live site's screen recording (hover previews, the case-study laptop's screen) */
  workLoop: (slug: string) => first(`/previews/${slug}.mp4`),
  /** the owner's cinematic loop for a case study's hero (its poster is the same name, .jpg) */
  workFilm: (slug: string) => first(`/work/${slug}-loop.mp4`),
};
