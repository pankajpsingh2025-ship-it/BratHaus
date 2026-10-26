#!/usr/bin/env node
// =========================================================
// Turn the Kling clips into the scroll-scrubbed process film.
//
//   node tools/make-film.mjs [folder]        (default: incoming/film)
//
//   • Takes every video in the folder in name order (film-1.mp4, film-2.mp4, …).
//   • Joins them into one continuous shot, with a short 0.25s dissolve at each
//     join to hide any tiny mismatch between one clip's end frame and the next
//     clip's start frame.
//   • Encodes for scrubbing (a keyframe every 10 frames, no B-frames, so the
//     browser can jump to any moment instantly, forwards and backwards):
//       public/film/process.mp4         1600×900, 24fps, no audio
//       public/film/process-mobile.mp4  960×540
//       public/film/process.jpg         poster (first frame)
//   • Switches the chapter on in src/data/film.js and sets its scroll length
//     (13vh per second of film, between 260vh and 640vh).
// Uses ffmpeg-static if installed (npm i -D ffmpeg-static), else ffmpeg on PATH.
// =========================================================
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

let ffmpeg = "ffmpeg";
try { ffmpeg = (await import("ffmpeg-static")).default || ffmpeg; } catch { /* use the one on PATH */ }

const dir = resolve(process.argv[2] || "incoming/film");
if (!existsSync(dir)) { console.error(`No folder ${dir}. Put the Kling clips there (film-1.mp4, film-2.mp4, …).`); process.exit(1); }
const clips = readdirSync(dir).filter((n) => /\.(mp4|mov|webm|mkv)$/i.test(n)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).map((n) => join(dir, n));
if (!clips.length) { console.error(`No video files in ${dir}.`); process.exit(1); }

// how long is each clip? (read from ffmpeg's own report)
const duration = (file) => {
  const out = spawnSync(ffmpeg, ["-hide_banner", "-i", file], { encoding: "utf8" }).stderr;
  const m = out.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  if (!m) throw new Error(`Can't read ${file}`);
  return +m[1] * 3600 + +m[2] * 60 + +m[3];
};
const lens = clips.map(duration);
console.log(clips.map((c, i) => `  ${c.split(/[\\/]/).pop()}  ${lens[i].toFixed(2)}s`).join("\n"));

// one filter graph: normalise every clip, then chain dissolves
const X = 0.25;
const parts = clips.map((_, i) => `[${i}:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=24,format=yuv420p,setsar=1,settb=AVTB[v${i}]`);
let last = "v0", offset = lens[0];
for (let i = 1; i < clips.length; i++) {
  offset -= X;
  parts.push(`[${last}][v${i}]xfade=transition=fade:duration=${X}:offset=${offset.toFixed(3)}[x${i}]`);
  last = `x${i}`; offset += lens[i];
}
const total = lens.reduce((a, b) => a + b, 0) - X * (clips.length - 1);
const outDir = resolve("public", "film");
mkdirSync(outDir, { recursive: true });
const master = join(outDir, ".master.mp4");
execFileSync(ffmpeg, ["-y", "-v", "error", ...clips.flatMap((c) => ["-i", c]), "-filter_complex", parts.join(";"), "-map", `[${last}]`, "-an", "-c:v", "libx264", "-crf", "16", "-preset", "medium", master], { stdio: "inherit" });

const encode = (out, w, h, crf) => execFileSync(ffmpeg, ["-y", "-v", "error", "-i", master, "-vf", `scale=${w}:${h}:flags=lanczos`, "-c:v", "libx264", "-g", "10", "-keyint_min", "10", "-bf", "0", "-crf", String(crf), "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", out]);
const desk = join(outDir, "process.mp4"), mob = join(outDir, "process-mobile.mp4");
encode(desk, 1600, 900, 24);
if (statSync(desk).size > 14 * 1048576) encode(desk, 1600, 900, 28);
encode(mob, 960, 540, 28);
if (statSync(mob).size > 5 * 1048576) encode(mob, 960, 540, 32);
execFileSync(ffmpeg, ["-y", "-v", "error", "-i", master, "-frames:v", "1", "-vf", "scale=1600:900", "-q:v", "4", join(outDir, "process.jpg")]);
execFileSync(process.platform === "win32" ? "cmd" : "rm", process.platform === "win32" ? ["/c", "del", master] : ["-f", master]);

// switch the chapter on and size its scroll to the film
const cfgPath = resolve("src", "content", "film.ts");
const vh = Math.max(260, Math.min(640, Math.round(total * 13)));
const cfg = readFileSync(cfgPath, "utf8").replace(/^(\s*)enabled:\s*(true|false)/m, "$1enabled: true").replace(/^(\s*)vh:\s*\d+/m, `$1vh: ${vh}`);
writeFileSync(cfgPath, cfg);
const mb = (f) => (statSync(f).size / 1048576).toFixed(1);
console.log(`\n✓ Film ${total.toFixed(1)}s from ${clips.length} clip(s): process.mp4 ${mb(desk)} MB, process-mobile.mp4 ${mb(mob)} MB, process.jpg. Chapter on, ${vh}vh of scroll.`);
