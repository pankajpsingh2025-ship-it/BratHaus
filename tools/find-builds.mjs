#!/usr/bin/env node
// =========================================================
// Find the websites you've built on this computer.
//
//   node tools/find-builds.mjs [folder …]      (default: the folder that contains this portfolio)
//
// Looks up to 3 levels deep for web projects (a package.json with Vite, Next,
// Astro and so on, or a plain folder with an index.html) and prints what it
// finds: path, framework, page title and last edit, plus a ready-made
// entry for builds.config.json. It only reads; nothing is changed.
// =========================================================
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";

const here = resolve(".");
const roots = (process.argv.slice(2).length ? process.argv.slice(2) : [resolve("..")]).map((r) => resolve(r));
const SKIP = new Set(["node_modules", ".git", "dist", "build", "out", ".next", ".cache", "_previous-version", "public", "incoming", "Library", "Applications", ".Trash"]);
const found = [];

const title = (dir) => {
  for (const f of ["index.html", "src/index.html", "app/layout.tsx", "app/layout.jsx"]) {
    const p = join(dir, f);
    if (!existsSync(p)) continue;
    const m = readFileSync(p, "utf8").match(/<title>([^<]*)<\/title>|title:\s*["'`]([^"'`]+)/i);
    if (m) return (m[1] || m[2]).trim().replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"');
  }
  return "";
};
const newest = (dir, depth = 0) => {
  let t = statSync(dir).mtimeMs;
  if (depth > 2) return t;
  for (const n of readdirSync(dir)) {
    if (SKIP.has(n) || n.startsWith(".")) continue;
    const p = join(dir, n);
    try { const s = statSync(p); t = Math.max(t, s.isDirectory() ? newest(p, depth + 1) : s.mtimeMs); } catch { /* unreadable */ }
  }
  return t;
};
const inspect = (dir) => {
  const pkgPath = join(dir, "package.json");
  if (!existsSync(pkgPath) && !existsSync(join(dir, "index.html"))) return false;
  let pkg = {};
  try { pkg = existsSync(pkgPath) ? JSON.parse(readFileSync(pkgPath, "utf8")) : {}; } catch { return false; }
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const framework = deps.next ? "next" : deps.astro ? "astro" : deps.vite ? "vite" : existsSync(pkgPath) ? "node" : "static";
  if (framework === "node" && !existsSync(join(dir, "index.html"))) return false;
  const pages = readdirSync(dir).filter((n) => n.endsWith(".html")).length;
  found.push({ path: dir, name: pkg.name || basename(dir), framework, title: title(dir), pages, edited: new Date(newest(dir)).toISOString().slice(0, 16).replace("T", " ") });
  return true;
};
const walk = (dir, depth) => {
  if (resolve(dir) === here) return;           // not the portfolio itself
  if (inspect(dir)) return;                    // a project: don't look inside it
  if (depth >= 3) return;
  let names = [];
  try { names = readdirSync(dir); } catch { return; }
  for (const n of names) {
    if (SKIP.has(n) || n.startsWith(".")) continue;
    const p = join(dir, n);
    try { if (statSync(p).isDirectory()) walk(p, depth + 1); } catch { /* unreadable */ }
  }
};
roots.forEach((r) => walk(r, 0));

found.sort((a, b) => (a.edited < b.edited ? 1 : -1));
// the same project in several folders: the newest is the one to use
const seen = new Set();
for (const f of found) { f.older = seen.has(f.name); seen.add(f.name); }
if (!found.length) { console.log("No web projects found. Pass the folder(s) that hold your sites: node tools/find-builds.mjs ~/Sites ~/Projects"); process.exit(0); }
console.log(`Found ${found.length} web project(s):\n`);
for (const f of found) console.log(`• ${f.title || f.name}${f.older ? "   (older copy, skipped)" : ""}\n  ${relative(here, f.path) || "."}  ·  ${f.framework}  ·  ${f.pages} page(s)  ·  last edited ${f.edited}`);
console.log("\nSuggested builds.config.json entries (check names, sectors and labels before using them):\n");
console.log(JSON.stringify(found.filter((f) => !f.older && (f.framework === "vite" || f.framework === "static")).map((f) => ({
  slug: f.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  name: f.title.split(/[|—–-]/)[0].trim() || f.name,
  sector: "",
  kind: "Concept build",
  line: "",
  featured: false,
  path: relative(here, f.path),
})), null, 2));
const other = found.filter((f) => !["vite", "static"].includes(f.framework));
if (other.length) console.log(`\nNot Vite (${other.map((f) => `${f.name}: ${f.framework}`).join(", ")}): give these a live "url" in builds.config.json instead of a "path".`);
