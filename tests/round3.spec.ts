import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import sharp from "sharp";

// Round 3 checks (fix brief section 10). Run on the production build, normally and with THROTTLE=6.
const OUT = "_reports/round3";
const THROTTLE = Number(process.env.THROTTLE || 0);
const tag = THROTTLE ? `-cpu${THROTTLE}` : "";
const PAGES = [
  { name: "home", path: "/" }, { name: "services", path: "/services" }, { name: "studio", path: "/studio" },
  { name: "work", path: "/work" }, { name: "case", path: "/work/wren-ashby" }, { name: "contact", path: "/contact" }, { name: "404", path: "/nope" },
];
fs.mkdirSync(`${OUT}/shots`, { recursive: true });

async function open(page: Page, path: string) {
  if (THROTTLE) { const cdp = await page.context().newCDPSession(page); await cdp.send("Emulation.setCPUThrottlingRate", { rate: THROTTLE }); }
  await page.goto(`${path}${path.includes("?") ? "&" : "?"}intro=0`, { waitUntil: "load" });
  await page.waitForTimeout(THROTTLE ? 5000 : 2500);
}
const scrollTo = (page: Page, y: number) => page.evaluate((y) => window.scrollTo(0, y), y);

// share of pixels within ±6 RGB of the most common colour
async function flatShare(png: Buffer) {
  const { data, info } = await sharp(png).resize({ width: 320 }).raw().toBuffer({ resolveWithObject: true });
  const n = info.width * info.height, ch = info.channels;
  const counts = new Map<number, number>();
  for (let i = 0; i < n; i++) { const k = ((data[i * ch] >> 3) << 10) | ((data[i * ch + 1] >> 3) << 5) | (data[i * ch + 2] >> 3); counts.set(k, (counts.get(k) || 0) + 1); }
  let top = 0, best = 0; counts.forEach((c, k) => { if (c > best) { best = c; top = k; } });
  const r = ((top >> 10) & 31) * 8 + 4, g = ((top >> 5) & 31) * 8 + 4, b = (top & 31) * 8 + 4;
  let same = 0;
  for (let i = 0; i < n; i++) if (Math.abs(data[i * ch] - r) <= 6 + 4 && Math.abs(data[i * ch + 1] - g) <= 6 + 4 && Math.abs(data[i * ch + 2] - b) <= 6 + 4) same++;
  return same / n;
}

// everything measured inside the page at one scroll position
function audit() {
  const vw = innerWidth, vh = innerHeight;
  const probe = document.createElement("div"); document.body.appendChild(probe);
  const px = (v: string) => { probe.style.fontSize = `var(${v})`; return parseFloat(getComputedStyle(probe).fontSize); };
  const scale = ["--t-display", "--t-h2", "--t-h3", "--t-lead", "--t-body", "--t-ui", "--t-label"].map(px);
  probe.remove();
  const visible = (el: Element) => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== "hidden" && Number(cs.opacity) > 0.05 && !el.closest("[aria-hidden='true'] canvas");
  };
  const texts: { tag: string; text: string; family: string; size: number; weight: number; w: number }[] = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set<Element>();
  while (walker.nextNode()) {
    const t = walker.currentNode as Text;
    if (!t.textContent || !t.textContent.trim()) continue;
    const el = t.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
    if (el.closest(".device-ui, script, style, noscript, .sr-only, [data-preloader], svg, dialog:not([open])")) continue;
    if (!visible(el)) continue;
    let o: Element | null = el, hidden = false;
    while (o) { const cs = getComputedStyle(o); if (Number(cs.opacity) < 0.05 || cs.visibility === "hidden") { hidden = true; break; } o = o.parentElement; }
    if (hidden) continue;
    const cs = getComputedStyle(el);
    texts.push({ tag: el.tagName.toLowerCase(), text: t.textContent.trim().slice(0, 40), family: cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(), size: parseFloat(cs.fontSize), weight: Number(cs.fontWeight), w: el.getBoundingClientRect().width });
  }
  // squeezed blocks: p, h1–h3, li with real text (≥ 40 characters), outside device UIs, chips and labels
  const squeezed = Array.from(document.querySelectorAll("p, h1, h2, h3, li")).filter((el) => {
    if (el.closest(".device-ui, [data-chip], .mono, nav, footer, dialog") || el.classList.contains("mono") || !visible(el)) return false;
    return (el.textContent || "").trim().length >= 40 && el.getBoundingClientRect().width < 240;
  }).map((el) => (el.textContent || "").trim().slice(0, 40));
  // header contrast
  const hdr = document.querySelector<HTMLElement>("[data-header]");
  let contrast = 21;
  if (hdr) {
    const lum = (c: number[]) => { const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
    const rgba = (s: string) => (s.match(/[\d.]+/g) || ["0", "0", "0", "0"]).map(Number);
    const bg = rgba(getComputedStyle(hdr).backgroundColor);
    const under = hdr.dataset.theme === "ivory" ? [243, 238, 230] : [14, 14, 13];
    const a = bg.length > 3 ? bg[3] : 1;
    const eff = [0, 1, 2].map((i) => bg[i] * a + under[i] * (1 - a));
    hdr.querySelectorAll<HTMLElement>("nav a:not(.btn), button").forEach((l) => {
      if (!visible(l)) return;
      const fg = rgba(getComputedStyle(l).color);
      const L1 = lum(fg), L2 = lum(eff);
      contrast = Math.min(contrast, (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05));
    });
  }
  return { scale, texts, squeezed, contrast, h1: document.querySelectorAll("h1").length, overflow: document.documentElement.scrollWidth > innerWidth + 1 };
}

for (const pg of PAGES) {
  test(`${pg.name}: no blank screens, no squeezed text, header readable, type system`, async ({ page }, info) => {
    const size = info.project.name;
    await open(page, pg.path);
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    const vh = page.viewportSize()!.height, vw = page.viewportSize()!.width;
    const problems: string[] = [];
    const families = new Set<string>(), sizes = new Set<number>(), weights = new Set<number>();
    let h1 = 0, step = 0;
    for (let y = 0; y < H - vh * 0.5; y += vh * 0.5, step++) {
      await scrollTo(page, y);
      await page.waitForTimeout(THROTTLE ? 900 : 450);
      const shot = await page.screenshot();
      fs.writeFileSync(`${OUT}/shots/${size}-${pg.name}-${String(step).padStart(2, "0")}${tag}.png`, shot);
      const flat = await flatShare(shot);
      const a = await page.evaluate(audit);
      // blank = over 90% one colour AND no real text on screen. (Pixel share alone flags airy text
      // screens: thin serif headings and a footer full of links cover under 10% of the pixels.)
      const words = a.texts.filter((t) => t.text.length >= 2).length;
      if (flat > 0.9 && words < 3) problems.push(`blank ${Math.round(flat * 100)}% (${words} text blocks) at y=${Math.round(y)}`);
      h1 = a.h1;
      if (a.overflow) problems.push(`horizontal overflow at y=${Math.round(y)}`);
      if (vw >= 1024 && a.squeezed.length) problems.push(`squeezed at y=${Math.round(y)}: ${a.squeezed.join(" | ")}`);
      if (a.contrast < 4.5) problems.push(`header contrast ${a.contrast.toFixed(2)} at y=${Math.round(y)}`);
      for (const t of a.texts) {
        families.add(t.family); weights.add(t.weight);
        if (!a.scale.some((s) => Math.abs(s - t.size) <= 0.5)) { sizes.add(t.size); problems.push(`size ${t.size}px off-scale: <${t.tag}> "${t.text}"`); }
        if (t.weight !== 400 && t.weight !== 500) problems.push(`weight ${t.weight}: <${t.tag}> "${t.text}"`);
      }
    }
    for (const f of families) if (!/^(Newsreader|Host Grotesk|Geist Mono)/i.test(f) && !/__(newsreader|hostGrotesk|host_grotesk|geist_mono|geistMono|Host_Grotesk|Geist_Mono|Newsreader)/i.test(f)) problems.push(`family ${f}`);
    if (h1 !== 1) problems.push(`${h1} h1 elements`);
    const unique = [...new Set(problems)];
    fs.writeFileSync(`${OUT}/${size}-${pg.name}${tag}.json`, JSON.stringify({ problems: unique, families: [...families], weights: [...weights] }, null, 1));
    expect(unique, unique.slice(0, 12).join("\n")).toEqual([]);
  });
}

test("home: the story never swaps, quality never drops to off", async ({ page }) => {
  await open(page, "/");
  const q0 = await page.evaluate(() => (window as unknown as { __quality?: string }).__quality);
  // the flat story is decided at startup (3D off, or a screen under 520px tall): then there's nothing to swap
  const flat = (await page.locator("[data-story-flat]").count()) > 0;
  test.skip(flat, "flat story from the start");
  const id = await page.getAttribute("section[data-story]", "data-story-id");
  if (q0 !== "off") expect(id).toBeTruthy();
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.mouse.move(200, 200);
  // wheel steps of 120px, top → bottom → top
  for (let y = 0; y < H; y += 120) await page.mouse.wheel(0, 120);
  await page.waitForTimeout(600);
  for (let y = H; y > 0; y -= 120) await page.mouse.wheel(0, -120);
  await page.waitForTimeout(800);
  if (q0 !== "off") expect(await page.getAttribute("section[data-story]", "data-story-id")).toBe(id);
  const q1 = await page.evaluate(() => (window as unknown as { __quality?: string }).__quality);
  expect(q1 === "off" ? q0 : "ok").toBe(q0 === "off" ? "off" : "ok");
  if (q0 !== "off") expect(await page.locator("[data-story-flat]").count()).toBe(0);
});

test("logo: solid in the header, 3D in the heroes", async ({ page }, info) => {
  await open(page, "/?debug");
  const header = await page.evaluate(() => Array.from(document.querySelectorAll("header svg path")).map((p) => ({ fill: getComputedStyle(p).fill, stroke: getComputedStyle(p).stroke })));
  expect(header.length).toBeGreaterThan(0);
  for (const p of header) { expect(p.fill).not.toBe("none"); expect(p.stroke === "none" || p.stroke === "").toBeTruthy(); }
  const q = await page.evaluate(() => (window as unknown as { __quality?: string }).__quality);
  const flat = (await page.locator("[data-story-flat]").count()) > 0;
  if (q !== "off" && !flat) expect(await page.evaluate(() => Boolean((window as unknown as { __story?: { logo?: unknown } }).__story?.logo))).toBeTruthy();
  else expect(await page.locator("img[src*='logo-3d-preview']").count()).toBeGreaterThan(0);
  await page.waitForTimeout(1500);
  fs.writeFileSync(`${OUT}/logo-home-${info.project.name}${tag}.png`, await page.screenshot());
  await open(page, "/studio");
  expect(await page.locator(".slot").count()).toBeGreaterThan(0);
  await page.waitForTimeout(2500);
  fs.writeFileSync(`${OUT}/logo-studio-${info.project.name}${tag}.png`, await page.screenshot());
});

test("hero: the H1 never shares pixels with the logo or the phone", async ({ page }) => {
  await open(page, "/?debug");
  const q = await page.evaluate(() => (window as unknown as { __quality?: string }).__quality);
  test.skip(q === "off" || (await page.locator("[data-story-flat]").count()) > 0, "flat story");
  for (const p of [0, 0.02, 0.04, 0.06, 0.08, 0.1]) {
    await page.evaluate((p) => { const el = document.querySelector<HTMLElement>("[data-story]")!; const f = el.querySelector<HTMLElement>("[data-front]")!; window.scrollTo(0, el.getBoundingClientRect().top + scrollY + (el.offsetHeight - f.offsetHeight) * p); }, p);
    await page.waitForTimeout(THROTTLE ? 2200 : 1400);
    const r = await page.evaluate(() => {
      const h = document.querySelector("section[data-story] h1")!;
      const hr = h.getBoundingClientRect(), o = Number(getComputedStyle(h.closest("[data-hero]")!).opacity);
      const st = (window as unknown as { __story?: { logo?: { x: number; y: number; w: number; h: number }; devices?: { phone?: { x: number; y: number; w: number; h: number } | null } } }).__story;
      return { h: { x: hr.left, y: hr.top, w: hr.width, h: hr.height }, o, logo: st?.logo, phone: st?.devices?.phone };
    });
    const hit = (a: { x: number; y: number; w: number; h: number }, b?: { x: number; y: number; w: number; h: number } | null) => Boolean(b) && a.x < b!.x + b!.w && b!.x < a.x + a.w && a.y < b!.y + b!.h && b!.y < a.y + a.h;
    if (r.o < 0.05) continue;
    expect(hit(r.h, r.phone), `H1 over the phone at ${p}`).toBeFalsy();
    // the logo's box is generous (its whole column); check the mark's actual footprint: the middle 80%
    if (r.logo) { const l = r.logo, m = { x: l.x + l.w * 0.1, y: l.y + l.h * 0.1, w: l.w * 0.8, h: l.h * 0.8 }; expect(hit(r.h, m), `H1 over the logo at ${p}`).toBeFalsy(); }
  }
});

test("statement: no band over 25vh without text", async ({ page }) => {
  await open(page, "/");
  await page.locator("#statement").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  const gap = await page.evaluate(() => {
    const s = document.querySelector("#statement")!.getBoundingClientRect();
    const rects = Array.from(document.querySelectorAll("#statement h2, #statement p")).map((e) => e.getBoundingClientRect()).sort((a, b) => a.top - b.top);
    let y = s.top, max = 0;
    for (const r of rects) { max = Math.max(max, r.top - y); y = Math.max(y, r.bottom); }
    max = Math.max(max, s.bottom - y);
    return max / innerHeight;
  });
  expect(gap).toBeLessThanOrEqual(0.25);
});

test("services: every service shows its device and plays its moment", async ({ page }, info) => {
  await open(page, "/services");
  for (const id of ["paid-ads", "websites", "ai-agents", "software"]) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await page.evaluate((id) => document.getElementById(id)!.scrollIntoView({ block: "start" }), id);
    await page.waitForTimeout(THROTTLE ? 4500 : 3200);
    const ok = await page.evaluate((id) => {
      const sec = document.getElementById(id)!;
      const ui = sec.querySelector(".device-ui");
      const out = Array.from(sec.querySelectorAll("p, h2, li")).filter((e) => !e.closest(".device-ui")).some((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.left < -1 || r.right > innerWidth + 1); });
      return { device: Boolean(ui && ui.getBoundingClientRect().width > 100), out };
    }, id);
    expect(ok.device, `${id} device`).toBeTruthy();
    expect(ok.out, `${id} text outside the viewport`).toBeFalsy();
    fs.writeFileSync(`${OUT}/services-${id}-${info.project.name}${tag}.png`, await page.screenshot());
  }
});

test("studio: the three beats, and no Principles", async ({ page }, info) => {
  await open(page, "/studio");
  expect(await page.getByText("Principles", { exact: false }).count()).toBe(0);
  const wide = page.viewportSize()!.width >= 1024;
  for (let i = 0; i < 3; i++) {
    await page.evaluate((i) => document.querySelectorAll("[data-panel]")[i].scrollIntoView({ block: "center" }), i);
    await page.waitForTimeout(THROTTLE ? 2500 : 1500);
    if (wide) {
      const on = await page.evaluate(() => Array.from(document.querySelectorAll("[data-panel]")).length && Array.from(document.querySelectorAll("#story [data-on]")).map((e) => e.textContent?.slice(0, 5)));
      expect(on && (on as string[])[0]?.startsWith(`0${i + 1}`), `beat ${i + 1} shown`).toBeTruthy();
    } else {
      expect(await page.locator("[data-panel]").nth(i).locator("h3").isVisible()).toBeTruthy();
    }
    fs.writeFileSync(`${OUT}/studio-beat-${i + 1}-${info.project.name}${tag}.png`, await page.screenshot());
  }
});
