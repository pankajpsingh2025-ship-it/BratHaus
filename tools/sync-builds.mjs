#!/usr/bin/env node
// =========================================================
// Bring every build listed in builds.config.json into the portfolio.
//
//   npm run builds                      all builds: import the live demo + record the preview video
//   npm run builds -- --only mereway    just one
//   npm run builds -- --no-video        skip (re)recording videos that already exist
//   npm run builds -- --data-only       only rewrite src/data/builds.json from the config
//
// For each build:
//   "path" (a Vite project on this computer) → tools/import-demo.mjs → public/demos/<slug>/
//   "url"  (a site that's already online)    → used as is for the live preview
//   "record" (optional) an address to record the video from instead, e.g. a local
//            dev server for a project that can't be imported (Next.js and so on)
//   then tools/record-preview.mjs → public/previews/<slug>.mp4 + .jpg
// and finally writes src/data/builds.json, which the site reads.
// =========================================================
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const dataOnly = args.includes("--data-only");
const noVideo = args.includes("--no-video");
const config = JSON.parse(readFileSync("builds.config.json", "utf8"));
const run = (script, list) => execFileSync(process.execPath, [resolve("tools", script), ...list], { stdio: "inherit" });

for (const b of config.builds) {
  if (dataOnly || (only && b.slug !== only)) continue;
  console.log(`\n=== ${b.name} (${b.slug}) ===`);
  if (b.path) run("import-demo.mjs", [b.slug, b.path]);
  const target = b.record || b.url || `/demos/${b.slug}${b.start && b.start !== "/" ? b.start : "/"}`;
  const hasVideo = existsSync(resolve("public", "previews", `${b.slug}.mp4`));
  if (!(noVideo && hasVideo)) run("record-preview.mjs", [b.slug, target, "--wait", String(b.wait || 6000)]);
}

const out = config.builds.map((b) => ({
  slug: b.slug,
  name: b.name,
  sector: b.sector || "",
  kind: b.kind || "Concept build",
  line: b.line || "",
  year: b.year || null,
  featured: !!b.featured,
  // "demo": a site built inside this portfolio (Vite multi-page, demos/<slug>/), served on the same origin
  demo: b.demo || b.url || (existsSync(resolve("public", "demos", b.slug, "index.html")) ? `/demos/${b.slug}${b.start && b.start !== "/" ? b.start : "/"}` : null),
  external: !!b.url,
  video: existsSync(resolve("public", "previews", `${b.slug}.mp4`)) ? `/previews/${b.slug}.mp4` : null,
  poster: existsSync(resolve("public", "previews", `${b.slug}.jpg`)) ? `/previews/${b.slug}.jpg`
    : existsSync(resolve("public", "work", `${b.slug}-screen-1.webp`)) ? `/work/${b.slug}-screen-1.webp` : null,
}));
writeFileSync(resolve("src", "data", "builds.json"), JSON.stringify({ builds: out }, null, 2) + "\n");
console.log(`\n✓ src/data/builds.json: ${out.length} build(s), ${out.filter((b) => b.demo).length} with a live demo, ${out.filter((b) => b.video).length} with a video.`);
