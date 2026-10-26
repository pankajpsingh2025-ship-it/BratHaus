#!/usr/bin/env node
// Phone screenshots of each live demo → public/work/<slug>-mobile-1…5.webp (390×844 @2x).
//   node tools/shoot-mobile.mjs [base-url]   (default http://127.0.0.1:5199, a static server over public/)
import { chromium } from "playwright";
import sharp from "sharp";
const base = process.argv[2] || "http://127.0.0.1:5199";
const slugs = ["wren-ashby", "mereway", "aurelith", "oakmere"];
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
for (const slug of slugs) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(`${base}/demos/${slug}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (let i = 0; i < 5; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round((H * i) / 4));
    await page.waitForTimeout(1400);
    await sharp(await page.screenshot({ type: "png" })).resize({ width: 780 }).webp({ quality: 80 }).toFile(`public/work/${slug}-mobile-${i + 1}.webp`);
  }
  console.log(`✓ ${slug}`);
  await page.close();
}
await browser.close();
