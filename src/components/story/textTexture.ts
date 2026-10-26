"use client";
import { CanvasTexture, LinearFilter, SRGBColorSpace } from "three";

// Text drawn into a texture at 3× (crisp at the sizes it's shown), for the glass chips and chat
// bubbles: the text has to live inside the glass, so it can't be a DOM layer under the canvas.
export function fontFamily() {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--font-host").trim();
  return v || "system-ui, sans-serif";
}

type Opts = { w: number; h: number; size: number; weight?: number; color: string; meta?: string; metaColor?: string; padX?: number; align?: "left" | "right"; lineHeight?: number };

export function textTexture(text: string, o: Opts) {
  const S = 3;
  const c = document.createElement("canvas");
  c.width = o.w * S; c.height = o.h * S;
  const g = c.getContext("2d")!;
  g.scale(S, S);
  const fam = fontFamily();
  const pad = o.padX ?? 16;
  g.font = `${o.weight ?? 500} ${o.size}px ${fam}`;
  g.fillStyle = o.color;
  g.textBaseline = "alphabetic";
  // wrap to the width
  const words = text.split(" "), lines: string[] = [];
  let line = "";
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (g.measureText(t).width > o.w - pad * 2 && line) { lines.push(line); line = w; } else line = t;
  }
  if (line) lines.push(line);
  const lh = o.size * (o.lineHeight ?? 1.32);
  const metaH = o.meta ? 16 : 0;
  const total = lines.length * lh + metaH;
  let y = (o.h - total) / 2 + o.size * 0.95;
  for (const l of lines) {
    const x = o.align === "right" ? o.w - pad - g.measureText(l).width : pad;
    g.fillText(l, x, y); y += lh;
  }
  if (o.meta) {
    g.font = `500 11px ${fam}`;
    g.fillStyle = o.metaColor ?? o.color;
    const x = o.align === "right" ? o.w - pad - g.measureText(o.meta).width : pad;
    g.fillText(o.meta, x, y - lh + 16 + 2);
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.minFilter = LinearFilter; tex.generateMipmaps = false; tex.anisotropy = 4;
  return tex;
}
