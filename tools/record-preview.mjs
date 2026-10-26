#!/usr/bin/env node
// =========================================================
// Record a smooth, silent preview video of a website for the portfolio.
//
//   node tools/record-preview.mjs <slug> [url-or-path] [--wait 6000] [--screens 6]
//
//   • url-or-path defaults to /demos/<slug>/ (a demo imported with tools/import-demo.mjs),
//     served straight from public/ by a tiny built-in server. A full https:// URL also works.
//   • It scrolls the page down and back up, one frame at a time (so even heavy 3D
//     sites come out perfectly smooth), then encodes:
//       public/previews/<slug>.mp4   1280×800, H.264, no audio, loops seamlessly
//       public/previews/<slug>.jpg   the first frame, used as the poster
//
// Needs: npm i -D playwright ffmpeg-static   and once: npx playwright install chromium
// (set CHROME_PATH to use a Chrome/Chromium you already have).
// =========================================================
import { chromium } from "playwright";
import { createServer } from "node:http";
import { execFileSync } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join, resolve, normalize } from "node:path";

const args = process.argv.slice(2);
const flag = (name, d) => { const i = args.indexOf(`--${name}`); return i >= 0 ? Number(args[i + 1]) : d; };
const [slug, target = `/demos/${args[0]}/`] = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
if (!slug) { console.error("Usage: node tools/record-preview.mjs <slug> [url-or-path] [--wait 6000] [--screens 6]"); process.exit(1); }
const WAIT = flag("wait", 6000), SCREENS = flag("screens", 6);
const DOWN = 240, UP = 60; // frames: 8s down, 2s back up = a 10s seamless loop at 30fps

let ffmpeg = "ffmpeg";
try { ffmpeg = (await import("ffmpeg-static")).default || ffmpeg; } catch { /* use the one on PATH */ }

// a tiny static server over public/ (only for local demos)
const MIME = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif", ".mp4": "video/mp4", ".webm": "video/webm", ".mp3": "audio/mpeg", ".ogg": "audio/ogg", ".m4a": "audio/mp4", ".wav": "audio/wav", ".woff": "font/woff", ".woff2": "font/woff2", ".glb": "model/gltf-binary", ".gltf": "model/gltf+json", ".hdr": "application/octet-stream", ".ico": "image/x-icon", ".txt": "text/plain" };
const root = resolve("public");
let server, url = target;
if (!/^https?:/.test(target)) {
  server = createServer((req, res) => {
    let p = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
    let file = join(root, p);
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    if (!file.startsWith(root) || !existsSync(file)) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": MIME[extname(file).toLowerCase()] || "application/octet-stream" });
    createReadStream(file).pipe(res);
  });
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  url = `http://127.0.0.1:${server.address().port}${target}`;
}

const frames = mkdtempSync(join(tmpdir(), `bh-${slug}-`));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ["--ignore-gpu-blocklist", "--enable-gpu-rasterization", "--autoplay-policy=no-user-gesture-required"] });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
  console.log(`Recording ${url}`);
  await page.goto(url, { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(WAIT); // let preloaders and intro animations finish
  const max = await page.evaluate((n) => Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight, innerHeight * n)), SCREENS);
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const total = DOWN + UP;
  for (let f = 0; f < total; f++) {
    const y = f < DOWN ? ease(f / (DOWN - 1)) * max : ease(1 - (f - DOWN + 1) / UP) * max;
    await page.evaluate(async (yy) => {
      window.scrollTo(0, yy);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }, y);
    await page.waitForTimeout(40);
    await page.screenshot({ path: join(frames, `${String(f).padStart(4, "0")}.jpg`), type: "jpeg", quality: 85, timeout: 180000 });
    if (f % 30 === 0) process.stdout.write(`  frame ${f}/${total}\r`);
  }
} finally {
  await browser.close();
  server?.close();
}

const outDir = resolve("public", "previews");
mkdirSync(outDir, { recursive: true });
const mp4 = join(outDir, `${slug}.mp4`), jpg = join(outDir, `${slug}.jpg`);
const encode = (crf) => execFileSync(ffmpeg, ["-y", "-v", "error", "-framerate", "30", "-i", join(frames, "%04d.jpg"),
  "-vf", "scale=1280:800:flags=lanczos", "-c:v", "libx264", "-crf", String(crf), "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", mp4]);
encode(25);
if (statSync(mp4).size > 8 * 1024 * 1024) encode(30); // keep it light
execFileSync(ffmpeg, ["-y", "-v", "error", "-i", join(frames, "0000.jpg"), "-vf", "scale=1280:800", "-q:v", "4", jpg]);
rmSync(frames, { recursive: true, force: true });
console.log(`\n✓ ${slug}: public/previews/${slug}.mp4 (${(statSync(mp4).size / 1048576).toFixed(1)} MB) and ${slug}.jpg`);
