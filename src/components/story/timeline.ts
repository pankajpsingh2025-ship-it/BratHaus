"use client";
import { gsap } from "@/lib/gsap";
import { resetRig, rig, type Xf } from "@/lib/rig";
import { fitToZone, zonePoint, zonePointPx, type Anchor, type Pose, type Zones } from "./zones";
import { BROWSER, LAPTOP, PHONE, TABLET, TICKET } from "./parts";

// The story's master timeline: duration 1 = the whole sticky scroll. One timeline drives the 3D rig
// AND the DOM overlays, so they can never drift apart. Chapter windows (progress), as the brief sets:
export const CH = {
  hero: [0, 0.08],
  ads: [0.08, 0.26],
  web: [0.26, 0.46],
  agents: [0.46, 0.66],
  software: [0.66, 0.84],
  finale: [0.84, 1],
} as const;
export const CHAPTER_STARTS = [CH.ads[0], CH.web[0], CH.agents[0], CH.software[0], CH.finale[0]];

// Every device keyframe is an anchor in the device zone ({ ax, ay, fill } + turns and depth).
// Landscape first, portrait in the second table (the brief's bracketed values).
type Keys = {
  hero: Anchor; phone1: Anchor; phoneChips: Anchor; phone2: Anchor; browser2: Anchor; browserBack: Anchor;
  phone3: Anchor; ticket3: Anchor; laptop4: Anchor; phone4: Anchor;
  nodes: [number, number][]; logoH: number;
};
const LANDSCAPE: Keys = {
  hero: { ax: 0.62, ay: 0.55, fill: 0.86, rx: 6, ry: -18, rz: 4 },
  phone1: { ax: 0.5, ay: 0.5, fill: 0.86 },
  phoneChips: { ax: 0.5, ay: 0.5, fill: 0.86 },
  phone2: { ax: 0.92, ay: 0.7, fill: 0.55, z: 0.5, ry: -10 },
  browser2: { ax: 0.45, ay: 0.48, fill: 1 },
  browserBack: { ax: 0.45, ay: 0.42, fill: 0.7, z: -2, o: 0.2 },
  phone3: { ax: 0.5, ay: 0.5, fill: 0.86 },
  ticket3: { ax: 0.86, ay: 0.62, fill: 0.42, z: 0.5, ry: -12 },
  laptop4: { ax: 0.55, ay: 0.55, fill: 1, rx: 10 },
  phone4: { ax: 0.1, ay: 0.75, fill: 0.35, z: 0.6, ry: 14 },
  nodes: [[0.1, 0.64], [0.37, 0.4], [0.63, 0.4], [0.9, 0.64]],
  logoH: 0.6,
};
const PORTRAIT: Keys = {
  // the hero keeps the phone in the top 52% (the H1, lead and buttons sit beneath it)
  hero: { ax: 0.5, ay: 0.46, fill: 0.84, rx: 4, ry: -14, rz: 3 },
  phone1: { ax: 0.5, ay: 0.5, fill: 0.94 },
  // the two chips need the right half of the zone: the phone steps left while they're up
  phoneChips: { ax: 0.28, ay: 0.5, fill: 0.9 },
  phone2: { ax: 0.85, ay: 0.8, fill: 0.4, z: -0.6 },
  browser2: { ax: 0.5, ay: 0.45, fill: 1 },
  browserBack: { ax: 0.5, ay: 0.4, fill: 0.7, z: -2, o: 0.2 },
  // a little smaller than chapter 1, to leave room for "Example conversation" under it
  phone3: { ax: 0.5, ay: 0.47, fill: 0.88 },
  ticket3: { ax: 0.5, ay: 0.2, fill: 0.72, z: 0.5 },
  laptop4: { ax: 0.5, ay: 0.5, fill: 1 },
  phone4: { ax: 0.5, ay: 0.9, fill: 0.3, z: -1, o: 0 },
  nodes: [[0.5, 0.14], [0.17, 0.5], [0.83, 0.5], [0.5, 0.86]],
  logoH: 0.62,
};

export type Rect = { x: number; y: number; w: number; h: number };
export type Plan = ReturnType<typeof planFor>;

/** Everything the story needs for one window size: device poses, screen zoom (1 CSS px ≈ 1 device px
 *  at each device's main pose), the finale's node and logo positions. Pure: used by both the DOM
 *  (Journey) and the canvas (StoryScene). */
export function planFor(zones: Zones) {
  const portrait = zones.layout === "portrait";
  const K = portrait ? PORTRAIT : LANDSCAPE;
  const tab = portrait ? TABLET : LAPTOP;
  const fit = (a: Anchor, box: { w: number; h: number; cy?: number }) => fitToZone(a, box, zones);
  const poses = {
    hero: fit(K.hero, PHONE.box), phone1: fit(K.phone1, PHONE.box), phoneChips: fit(K.phoneChips, PHONE.box),
    phone2: fit(K.phone2, PHONE.box), browser2: fit(K.browser2, BROWSER.box), browserBack: fit(K.browserBack, BROWSER.box),
    phone3: fit(K.phone3, PHONE.box), ticket3: fit(K.ticket3, TICKET.box), laptop4: fit(K.laptop4, tab.box), phone4: fit(K.phone4, PHONE.box),
  };
  // the real on-screen width of each screen at its main pose → that screen's zoom
  const px = (p: Pose, worldW: number) => worldW * p.s * p.pxPerUnit;
  const zoom = {
    phone: px(poses.phone1, PHONE.screenW) / PHONE.cssW,
    browser: px(poses.browser2, BROWSER.screenW) / BROWSER.cssW,
    laptop: px(poses.laptop4, tab.screenW) / tab.cssW,
    ticket: px(poses.ticket3, TICKET.w) / TICKET.cssW,
  };
  const d = zones.device;
  const nodes = K.nodes.map(([ax, ay]) => ({ ...zonePoint(ax, ay, 0, zones), px: d.x + ax * d.w, py: d.y + ay * d.h }));
  const centre = zonePoint(0.5, 0.5, 0, zones);
  const logo = { x: centre.x, y: centre.y, z: 0, h: K.logoH * d.h * centre.k };
  return { zones, portrait, poses, zoom, nodes, logo, tablet: portrait, heroLogo: heroLogo(zones) };
}

/** The hero's 3D logo box (CSS px) and its world placement: landscape, columns 8–12 at 70% of the
 *  screen's height, centred; portrait, the top of the screen under the header (38%, 30% on short
 *  phones), above the words. LOGO_H is the mark's height in world units at fit 1. */
const LOGO_H = 2.32;
export function heroLogo(zones: Zones) {
  const { vw, vh, header, margin } = zones;
  const col = (vw - margin * 2) / 12;
  const box = zones.layout === "portrait"
    ? (() => { const bottom = vh * (vh < 720 ? 0.3 : 0.38); return { x: margin, y: header + 8, w: vw - margin * 2, h: bottom - header - 8 }; })()
    : { x: margin + col * 7.5, y: header, w: col * 4.5, h: vh - header };
  const hPx = zones.layout === "portrait" ? Math.min(box.h * 0.86, box.w * 1.1) : Math.min(vh * 0.6, box.w * 1.15);
  const p = zonePointPx(box.x + box.w / 2, box.y + box.h / 2, 0, zones);
  return { box, x: p.x, y: p.y, z: 0, fit: (hPx * p.k) / LOGO_H, hPx };
}

const xf = (p: Pose, o?: number): Partial<Xf> => ({ x: p.x, y: p.y, z: p.z, rx: p.rx, ry: p.ry, rz: p.rz, s: p.s, o: o ?? p.o });

export type Overlays = {
  hero: HTMLElement | null;      // the hero's label, H1, lead and actions
  chapters: HTMLElement[];       // 4 chapter blocks, all in the same place
  finale: HTMLElement | null;
  example: HTMLElement | null;   // the one "EXAMPLE BUSINESS · FICTIONAL" label
  convo: HTMLElement | null;     // "EXAMPLE CONVERSATION", under the chat
  chips: HTMLElement[];          // the targeting chips (DOM, flat)
  chipsLabel: HTMLElement | null;
  nodeLabels: HTMLElement[];     // AD · WEBSITE · AI AGENT · DASHBOARD
  scrollHint: HTMLElement | null;
  glow: HTMLElement | null;      // the hero logo's soft glow
};

/** Place the DOM overlays that sit beside devices (chips, node labels, captions) for this plan. */
export function placeOverlays(plan: Plan, ov: Overlays) {
  const { zones, poses } = plan;
  const gap = 20;
  // chips beside the phone, never across its frame: alternate sides, wrap onto two lines if a side is narrow
  const ph = poses.phoneChips;
  const phoneW = (PHONE.w / PHONE.box.w) * ph.pw, phoneH = (PHONE.h / PHONE.box.h) * ph.ph;
  const left = ph.cx - phoneW / 2 - gap, right = ph.cx + phoneW / 2 + gap;
  const minX = Math.max(zones.device.x - 40, zones.text.x + zones.text.w + 16);
  const maxX = zones.device.x + zones.device.w;
  const room = { l: left - minX, r: maxX - right };
  const ys = plan.portrait ? [0.36, 0.6] : [0.24, 0.48, 0.72];
  ov.chips.forEach((el, i) => {
    if (i >= ys.length) { el.style.display = "none"; return; }
    el.style.display = "";
    el.style.maxWidth = "none"; el.style.whiteSpace = "nowrap";
    const w = el.offsetWidth;
    let side: "l" | "r" = plan.portrait ? "r" : i % 2 === 0 ? "l" : "r";
    if (w > room[side] && room[side === "l" ? "r" : "l"] > room[side]) side = side === "l" ? "r" : "l";
    if (w > room[side]) { el.style.whiteSpace = "normal"; el.style.maxWidth = `${Math.max(120, room[side])}px`; }
    const cw = el.offsetWidth, chh = el.offsetHeight;
    const x = side === "l" ? left - cw : right;
    const y = ph.cy - phoneH / 2 + phoneH * ys[i] - chh / 2;
    el.style.left = `${x.toFixed(0)}px`; el.style.top = `${y.toFixed(0)}px`;
    if (i === 0 && ov.chipsLabel) {
      ov.chipsLabel.style.left = `${(side === "l" ? x + cw - ov.chipsLabel.offsetWidth : x).toFixed(0)}px`;
      ov.chipsLabel.style.top = `${(y - 26).toFixed(0)}px`;
    }
  });
  // "Example conversation" under the phone in chapter 03
  if (ov.convo) {
    const p3 = poses.phone3;
    ov.convo.style.left = `${p3.cx.toFixed(0)}px`;
    ov.convo.style.top = `${(p3.cy + p3.ph / 2 + 10).toFixed(0)}px`;
  }
  // node labels under each node
  ov.nodeLabels.forEach((el, i) => {
    const n = plan.nodes[i]; if (!n) return;
    el.style.left = `${n.px.toFixed(0)}px`; el.style.top = `${(n.py + 30).toFixed(0)}px`;
  });
  // the hero logo's glow, centred on the logo
  if (ov.glow) {
    const b = plan.heroLogo.box, s = plan.heroLogo.hPx * 1.5;
    Object.assign(ov.glow.style, { left: `${b.x + b.w / 2 - s / 2}px`, top: `${b.y + b.h / 2 - s / 2}px`, width: `${s}px`, height: `${s}px` });
  }
}

/** Build the master timeline for a plan. Resets the rig first.
 *  Calm, not random: each chapter spends its first quarter arriving, HOLDS still for the middle half
 *  (only screen UI and small loops change), and spends its last quarter leaving. */
export function buildStory(plan: Plan, ov: Overlays) {
  const P = plan.poses;
  resetRig();
  const below = (p: Pose) => ({ ...p, y: p.y - (p.ph / p.pxPerUnit) * 1.1 });
  Object.assign(rig.phone, xf(below(P.phone1), 0));
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut", duration: 0.04 } });

  // chapter text: only one at a time, crossfading over 0.02 at each boundary, always in the same place
  const textIn = (el: Element | null, t: number) => el && tl.fromTo(el, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.014, ease: "power2.out", immediateRender: false }, t + 0.004);
  const textOut = (el: Element | null, t: number) => el && tl.to(el, { autoAlpha: 0, y: -16, duration: 0.012, ease: "power2.in" }, t - 0.012);
  const fadeIn = (el: Element | Element[] | null, t: number, d = 0.02) => el && tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: d, ease: "power1.out", immediateRender: false }, t);
  const fadeOut = (el: Element | Element[] | null, t: number, d = 0.015) => el && tl.to(el, { autoAlpha: 0, duration: d, ease: "power1.in" }, t);

  // ---------------- hero (0–0.08): the logo turns edge-on and lifts away, the words leave, the phone rises ----------------
  tl.to(rig.logo, { exit: 1, duration: 0.07, ease: "power2.in" }, 0);
  fadeOut(ov.glow, 0.01, 0.05);
  tl.to(ov.hero, { autoAlpha: 0, y: -24, duration: 0.04, ease: "power2.in" }, 0.02);
  fadeOut(ov.scrollHint, 0.01, 0.02);
  tl.to(rig.phone, { o: 1, duration: 0.01, ease: "none" }, 0.045);
  tl.to(rig.phone, { ...xf(P.phone1), duration: 0.055, ease: "power2.out" }, 0.045);

  // ---------------- 01 · paid ads (0.08–0.26): in to 0.125, hold to 0.215 ----------------
  textIn(ov.chapters[0], CH.ads[0]);
  fadeIn(ov.example, 0.09);
  tl.to(rig.ui, { feed: 1, duration: 0.03 }, 0.095);
  if (plan.portrait) tl.to(rig.phone, { ...xf(P.phoneChips), duration: 0.02 }, 0.105);
  ov.chips.forEach((c, i) => tl.fromTo(c, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.012, ease: "expo.out", immediateRender: false }, 0.122 + i * 0.006));
  fadeIn(ov.chipsLabel, 0.122, 0.012);
  tl.to(rig.thread, { route: 1, duration: 0.04, ease: "power1.inOut" }, 0.13);
  tl.to(rig.ui, { tap: 1, duration: 0.02, ease: "power1.out" }, 0.19);
  fadeOut([...ov.chips, ...(ov.chipsLabel ? [ov.chipsLabel] : [])], 0.218, 0.012);
  if (plan.portrait) tl.to(rig.phone, { ...xf(P.phone1), duration: 0.02 }, 0.225);
  textOut(ov.chapters[0], CH.web[0]);

  // ---------------- 02 · websites (0.26–0.46): the site grows out of the phone, separates, holds ----------------
  textIn(ov.chapters[1], CH.web[0]);
  tl.to(rig.ui, { site: 1, duration: 0.015 }, 0.255);
  // the website starts as exactly the phone screen's rectangle (q = 1) and ends at its own pose
  const p1 = P.phone1;
  const s0 = (PHONE.screenW * p1.s) / BROWSER.screenW;
  Object.assign(rig.browser, { x: p1.x, y: p1.y, z: p1.z + 0.06, rx: 0, ry: 0, rz: 0, s: s0, o: 0, q: 1 });
  tl.to(rig.browser, { o: 1, duration: 0.006, ease: "none" }, 0.264);
  tl.to(rig.browser, { ...xf(P.browser2, 1), q: 0, duration: 0.04 }, 0.266);
  tl.to(rig.phone, { ...xf(P.phone2), duration: 0.04 }, 0.266);
  tl.to(rig.thread, { route: 2, duration: 0.03 }, 0.29);
  // exploded at the start of the hold, together again before the chapter leaves
  tl.to(rig.layers, { spread: 1, duration: 0.025, ease: "power2.inOut" }, 0.306);
  tl.to(rig.browser, { ry: 24, duration: 0.025 }, 0.306);
  tl.to(rig.layers, { spread: 0, duration: 0.02 }, 0.41);
  tl.to(rig.browser, { ry: 0, duration: 0.02 }, 0.41);
  textOut(ov.chapters[1], CH.agents[0]);

  // ---------------- 03 · AI agents (0.46–0.66): the chat, held while the messages arrive ----------------
  textIn(ov.chapters[2], CH.agents[0]);
  tl.to(rig.browser, { ...xf(P.browserBack), duration: 0.035 }, 0.46);
  tl.to(rig.browser, { o: 0, duration: 0.012, ease: "none" }, 0.49);
  tl.to(rig.phone, { ...xf(P.phone3), duration: 0.045 }, 0.46);
  tl.to(rig.ui, { chat: 1, duration: 0.015 }, 0.47);
  fadeIn(ov.convo, 0.5);
  tl.to(rig.thread, { route: 3, duration: 0.03 }, 0.48);
  // four messages, one by one, with the typing indicator before each of the agent's replies
  [0.515, 0.54, 0.565, 0.59].forEach((t, i) => {
    if (i % 2 === 1) {
      tl.to(rig.ui, { typing: 1, duration: 0.003, ease: "none" }, t - 0.013);
      tl.to(rig.ui, { typing: 0, duration: 0.003, ease: "none" }, t - 0.002);
    }
    tl.to(rig.ui, { msg: i + 1, duration: 0.008, ease: "power1.out" }, t);
  });
  // the confirmation lifts out of the screen as the booking ticket
  Object.assign(rig.ticket, xf(P.ticket3, 0));
  tl.to(rig.ticket, { o: 1, duration: 0.005, ease: "none" }, 0.608);
  tl.to(rig.ticket, { lift: 1, duration: 0.025 }, 0.608);
  tl.to(rig.thread, { route: 4, duration: 0.02 }, 0.62);
  fadeOut(ov.convo, 0.645, 0.01);
  textOut(ov.chapters[2], CH.software[0]);

  // ---------------- 04 · software (0.66–0.84): the laptop opens, the ticket lands, then a hold ----------------
  textIn(ov.chapters[3], CH.software[0]);
  const L4 = P.laptop4;
  Object.assign(rig.laptop, xf(below(L4), 0));
  rig.lid.open = plan.tablet ? 1 : 0;
  tl.to(rig.laptop, { o: 1, duration: 0.005, ease: "none" }, 0.66);
  tl.to(rig.laptop, { ...xf(L4, 1), duration: 0.035 }, 0.66);
  if (!plan.tablet) tl.to(rig.lid, { open: 1, duration: 0.03 }, 0.672);
  tl.to(rig.phone, { ...xf(P.phone4), duration: 0.035 }, 0.66);
  tl.to(rig.thread, { route: 5, duration: 0.03 }, 0.68);
  // the ticket flies along the thread into Saturday 10:30
  tl.to(rig.fly, { p: 1, duration: 0.03 }, 0.7);
  tl.to(rig.ui, { diary: 1, duration: 0.015, ease: "power2.out" }, 0.727);
  tl.to(rig.ui, { toast: 1, duration: 0.01, ease: "expo.out" }, 0.735);
  tl.to(rig.ui, { auto: 1, duration: 0.03, ease: "none" }, 0.75);
  textOut(ov.chapters[3], CH.finale[0]);
  fadeOut(ov.example, CH.finale[0] - 0.012, 0.01);

  // ---------------- finale (0.84–1): nodes, held with their labels, then the mark ----------------
  textIn(ov.finale, CH.finale[0]);
  const [nAd, , , nDash] = plan.nodes;
  const glide = { duration: 0.035 };
  tl.to(rig.ui, { toast: 0, duration: 0.01 }, 0.842);
  tl.to(rig.phone, { x: nAd.x, y: nAd.y, z: 0, rx: 0, ry: 0, rz: 0, s: P.phone4.s * 0.4, ...glide }, 0.842);
  tl.to(rig.laptop, { x: nDash.x, y: nDash.y - LAPTOP.box.cy * L4.s * 0.2, z: 0, s: L4.s * 0.2, ...glide }, 0.842);
  tl.to([rig.phone, rig.laptop], { s: 0, o: 0, duration: 0.02, ease: "power2.in" }, 0.862);
  tl.to(rig.nodes, { p: 1, duration: 0.03 }, 0.855);
  ov.nodeLabels.forEach((el, i) => tl.fromTo(el, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.012, ease: "power2.out", immediateRender: false }, 0.875 + i * 0.004));
  // the last 6%: the thread becomes the BratHaus mark and holds
  fadeOut(ov.nodeLabels, 0.94, 0.012);
  tl.to(rig.nodes, { logo: 1, duration: 0.05 }, 0.94);
  tl.to({}, { duration: 0.0001 }, 1);
  return tl;
}

/** Which chapter (0 hero, 1–4 the services, 5 finale) a progress value is in, and how far through it. */
export function chapterAt(p: number) {
  const w = [CH.hero, CH.ads, CH.web, CH.agents, CH.software, CH.finale];
  for (let i = w.length - 1; i >= 0; i--) if (p >= w[i][0]) return { index: i, within: Math.min(1, (p - w[i][0]) / (w[i][1] - w[i][0])) };
  return { index: 0, within: 0 };
}
