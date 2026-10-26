#!/usr/bin/env node
// Real screenshots of each concept build → public/work/<slug>-screen-1.webp (hero) and -screen-2.webp (a key section).
// Uses the running dev server: node tools/shoot-screens.mjs [http://127.0.0.1:5190]
import { chromium } from "playwright";
import sharp from "sharp";
const base = process.argv[2] || "http://127.0.0.1:5190";
const SHOTS = { "wren-ashby": [0, "#light"], mereway: [0, "#glass"], aurelith: [0, "#collection"], oakmere: [0, ".night"] };
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ["--ignore-gpu-blocklist"] });
for (const [slug, [first, second]] of Object.entries(SHOTS)) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
  await page.goto(`${base}/demos/${slug}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3200);
  const shot = async (n) => sharp(await page.screenshot({ type: "png" })).webp({ quality: 84 }).toFile(`public/work/${slug}-screen-${n}.webp`);
  await shot(1);
  await page.evaluate((sel) => { const el = document.querySelector(sel); window.scrollTo(0, el.getBoundingClientRect().top + scrollY); }, second);
  await page.waitForTimeout(2600);
  if (slug === "oakmere") { // talk to the receptionist first, so the hero shot shows a real booking
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(600);
    await page.locator(".rx__chips button", { hasText: "chipped" }).click(); await page.waitForTimeout(2600);
    await page.locator(".rx__slots button").first().click(); await page.waitForTimeout(3200);
    await shot(1);
    await page.evaluate((sel) => { const el = document.querySelector(sel); window.scrollTo(0, el.getBoundingClientRect().top + scrollY); }, second);
    await page.waitForTimeout(2600);
  }
  if (slug === "mereway") { // wipe a stripe through the fog so the screenshot shows the interaction
    const r = await page.locator(".glass__frame").boundingBox();
    await page.mouse.move(r.x + r.width * 0.15, r.y + r.height * 0.6);
    for (let i = 0; i <= 30; i++) await page.mouse.move(r.x + r.width * (0.15 + i * 0.022), r.y + r.height * (0.6 - Math.sin(i / 5) * 0.12));
    await page.waitForTimeout(200);
  }
  await shot(2);
  console.log(`✓ ${slug}: screen-1, screen-2`);
  await page.close();
}
await browser.close();
