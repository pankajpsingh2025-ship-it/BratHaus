import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { MARK_PATHS, MARK_VIEWBOX } from "@/content/brand";

// Social share images, 1200×630: night, the solid gold BratHaus mark, and the page title in
// Newsreader (the site's serif). Case studies also show their poster. og-bg.webp (owner art) becomes the backdrop once it exists.
export const OG_SIZE = { width: 1200, height: 630 };
const root = process.cwd();
const font = (weight: 500) => readFile(path.join(root, "node_modules/@fontsource/host-grotesk/files", `host-grotesk-latin-${weight}-normal.woff`));
const serifFont = () => readFile(path.join(root, "node_modules/@fontsource/newsreader/files", "newsreader-latin-400-normal.woff"));

async function dataUrl(publicPath: string, width: number) {
  const file = path.join(root, "public", publicPath.replace(/^\//, ""));
  if (!existsSync(file)) return null;
  const png = await sharp(file).resize({ width, withoutEnlargement: true }).png().toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

export async function ogImage({ title, em, kicker, poster }: { title: string; em?: string; kicker: string; poster?: string }) {
  const [serif, medium, bg, pic] = await Promise.all([serifFont(), font(500), dataUrl("/images/og-bg.webp", 1200), poster ? dataUrl(poster, 520) : Promise.resolve(null)]);
  const long = (title + (em ?? "")).length > 30;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0e0e0d", color: "#f3eee6", position: "relative", fontFamily: "Host" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {bg ? <img src={bg} width={1200} height={630} style={{ position: "absolute", inset: 0, objectFit: "cover" }} alt="" />
          : <div style={{ position: "absolute", inset: 0, display: "flex", background: "radial-gradient(55% 70% at 85% 45%, #1d1a15, rgba(14,14,13,0) 70%)" }} />}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, width: pic ? 700 : 1100, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg width="44" height="54" viewBox={MARK_VIEWBOX} fill="#d4af7c">
              {Object.values(MARK_PATHS).map((d) => <path key={d} d={d} />)}
            </svg>
            <span style={{ fontSize: 30, fontWeight: 500, letterSpacing: -0.6 }}>BratHaus</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <span style={{ fontSize: 18, fontWeight: 500, letterSpacing: 3.5, textTransform: "uppercase", color: "#b9b3a9" }}>{kicker}</span>
            <div style={{ display: "flex", flexDirection: "column", fontFamily: "Serif", fontSize: long ? 66 : 84, fontWeight: 400, lineHeight: 1.04, letterSpacing: long ? -1.2 : -1.6 }}>
              <span>{title}</span>
              {em && <span>{em}</span>}
            </div>
          </div>
        </div>
        {pic && (
          <div style={{ position: "absolute", right: 64, top: 64, bottom: 64, width: 400, display: "flex", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(243,238,230,0.15)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pic} width={400} height={502} style={{ objectFit: "cover", width: "100%", height: "100%" }} alt="" />
          </div>
        )}
      </div>
    ),
    { ...OG_SIZE, fonts: [{ name: "Serif", data: serif, style: "normal", weight: 400 }, { name: "Host", data: medium, style: "normal", weight: 500 }] },
  );
}
