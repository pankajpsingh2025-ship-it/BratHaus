#!/usr/bin/env node
// =========================================================
// Import a finished website into the portfolio as a live demo.
//
//   node tools/import-demo.mjs <slug> <path-to-the-site's-project-folder>
//   e.g. node tools/import-demo.mjs wren-ashby ../wren-ashby
//
// It builds the site (Vite) with the base path /demos/<slug>/ straight into
// public/demos/<slug>/, then fixes the links the base option can't reach:
// hand-written root paths such as href="/buy.html", url(/images/x.webp) or
// "/images/hero.webp" inside scripts. A path is only rewritten when that file
// or folder really exists in the build, so nothing else is touched.
// The source project is never modified (the build is written elsewhere).
// =========================================================
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { join, resolve, extname } from "node:path";

const [slug, src] = process.argv.slice(2);
if (!slug || !src || !/^[a-z0-9-]+$/.test(slug)) {
  console.error("Usage: node tools/import-demo.mjs <slug> <path-to-project>   (slug: lower-case letters, numbers, dashes)");
  process.exit(1);
}
const srcDir = resolve(src);
if (!existsSync(join(srcDir, "package.json"))) { console.error(`No package.json in ${srcDir}`); process.exit(1); }
const base = `/demos/${slug}/`;
const out = resolve("public", "demos", slug);

// 1. build with the base path, straight into the portfolio
if (!existsSync(join(srcDir, "node_modules"))) execFileSync("npm", ["install", "--no-audit", "--no-fund"], { cwd: srcDir, stdio: "inherit" });
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
execFileSync("npx", ["vite", "build", "--base", base, "--outDir", out, "--emptyOutDir"], { cwd: srcDir, stdio: "inherit" });

// 2. fix the root paths the base option doesn't rewrite
const files = [];
const walk = (d) => readdirSync(d).forEach((n) => { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : files.push(p); });
walk(out);
const exists = (path) => { const clean = decodeURIComponent(path.split(/[?#]/)[0]); return clean && existsSync(join(out, clean)); };
let changed = 0;
for (const f of files) {
  if (![".html", ".css", ".js", ".json", ".webmanifest", ".svg"].includes(extname(f))) continue;
  const before = readFileSync(f, "utf8");
  let after = before
    // any quoted, url()'d or attribute root path that exists in the build
    .replace(/(["'`(=,\s])\/(?!\/|demos\/)([A-Za-z0-9_.~%-][^"'`)\s,]*)/g, (m, pre, path) => (exists(path) ? `${pre}${base}${path}` : m));
  if (extname(f) === ".html") {
    // links home: href="/" and href="/#section"
    after = after.replace(/href=(["'])\/(#[^"']*)?\1/g, (_, q, hash = "") => `href=${q}${base}${hash}${q}`);
  }
  if (after !== before) { writeFileSync(f, after); changed++; }
}
writeFileSync(join(out, "demo.json"), JSON.stringify({ slug, base, builtFrom: srcDir.split(/[\\/]/).pop(), builtAt: new Date().toISOString() }, null, 2));
console.log(`\n✓ ${slug}: built into public/demos/${slug}/ (${files.length} files, ${changed} rewritten). Open ${base} in the portfolio.`);
