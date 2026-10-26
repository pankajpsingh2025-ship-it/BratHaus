// Mereway: a concept build by BratHaus.
// Live rain over the page; a dome that follows you and keeps the house dry;
// fogged glass you wipe clear; plain-English cover.
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource-variable/bricolage-grotesque/standard.css";
import "./style.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const dpr = Math.min(devicePixelRatio, 2);

// ---------- rain, with a dome that stays dry ----------
const hero = document.querySelector(".hero"), rainC = document.querySelector(".rain"), dome = document.querySelector(".dome");
const rc = rainC.getContext("2d");
let W = 0, H = 0, drops = [], splashes = [], domeX = 0.62, domeTarget = 0.62;
const sizeRain = () => {
  W = hero.clientWidth; H = hero.clientHeight;
  rainC.width = W * dpr; rainC.height = H * dpr; rc.setTransform(dpr, 0, 0, dpr, 0, 0);
  const n = Math.round((W * H) / (innerWidth < 760 ? 2600 : 1700));
  drops = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, v: 9 + Math.random() * 9, l: 10 + Math.random() * 18, a: 0.15 + Math.random() * 0.35 }));
};
const domeGeom = () => { const r = dome.getBoundingClientRect(), h = hero.getBoundingClientRect(); return { cx: r.left - h.left + r.width / 2, cy: r.bottom - h.top - r.height * (10 / 220), R: r.width * (190 / 400) }; };
let dg = { cx: 0, cy: 0, R: 0 };
const rain = () => {
  rc.clearRect(0, 0, W, H);
  rc.lineCap = "round";
  for (const d of drops) {
    d.y += reduced ? 0 : d.v; d.x -= reduced ? 0 : d.v * 0.12;
    const dx = d.x - dg.cx, dy = d.y - dg.cy;
    if (dy < 0 && dx * dx + dy * dy < dg.R * dg.R) { // hit the dome
      if (splashes.length < 160) splashes.push({ x: d.x, y: d.y, t: 0 });
      d.y = -20; d.x = Math.random() * W * 1.1;
    }
    if (d.y > H + 20) { d.y = -20; d.x = Math.random() * W * 1.1; }
    rc.strokeStyle = `rgba(200, 220, 240, ${d.a})`; rc.lineWidth = 1;
    rc.beginPath(); rc.moveTo(d.x, d.y); rc.lineTo(d.x + d.l * 0.12, d.y - d.l); rc.stroke();
  }
  splashes = splashes.filter((s) => (s.t += 0.08) < 1);
  for (const s of splashes) { rc.strokeStyle = `rgba(233, 185, 73, ${0.6 * (1 - s.t)})`; rc.beginPath(); rc.arc(s.x, s.y, 2 + s.t * 7, Math.PI * 1.1, Math.PI * 1.9); rc.stroke(); }
};
const place = () => { domeX += (domeTarget - domeX) * 0.08; dome.style.left = `${domeX * 100}%`; dg = domeGeom(); };
hero.addEventListener("pointermove", (e) => { const r = hero.getBoundingClientRect(); domeTarget = Math.min(0.85, Math.max(0.15, (e.clientX - r.left) / r.width)); });
sizeRain(); addEventListener("resize", sizeRain);
let heroOn = true;
new IntersectionObserver(([e]) => (heroOn = e.isIntersecting)).observe(hero);

// ---------- fogged glass you wipe clear ----------
const frame = document.querySelector(".glass__frame"), fog = document.querySelector(".fog"), fc = fog.getContext("2d");
let FW = 0, FH = 0, beads = [];
const paintFog = (alpha = 1) => {
  fc.globalCompositeOperation = "source-over";
  fc.globalAlpha = alpha;
  const g = fc.createLinearGradient(0, 0, 0, FH); g.addColorStop(0, "rgba(176, 192, 208, 0.9)"); g.addColorStop(1, "rgba(120, 138, 158, 0.92)");
  fc.fillStyle = g; fc.fillRect(0, 0, FW, FH);
  fc.globalAlpha = 1;
  for (const b of beads) { fc.fillStyle = "rgba(235, 242, 250, 0.35)"; fc.beginPath(); fc.ellipse(b.x, b.y, b.r, b.r * 1.25, 0, 0, Math.PI * 2); fc.fill(); }
};
const sizeFog = () => {
  FW = frame.clientWidth; FH = frame.clientHeight;
  fog.width = FW * dpr; fog.height = FH * dpr; fc.setTransform(dpr, 0, 0, dpr, 0, 0);
  beads = Array.from({ length: Math.round((FW * FH) / 900) }, () => ({ x: Math.random() * FW, y: Math.random() * FH, r: 1 + Math.random() * 3 }));
  paintFog();
};
let last = null, wiped = 0;
const wipe = (x, y) => {
  fc.globalCompositeOperation = "destination-out";
  const r = Math.max(46, FW * 0.07);
  const g = fc.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(0.7, "rgba(0,0,0,0.85)"); g.addColorStop(1, "rgba(0,0,0,0)");
  fc.fillStyle = g;
  const steps = last ? Math.ceil(Math.hypot(x - last.x, y - last.y) / (r * 0.3)) : 1;
  for (let i = 1; i <= steps; i++) { const px = last ? last.x + ((x - last.x) * i) / steps : x, py = last ? last.y + ((y - last.y) * i) / steps : y; fc.beginPath(); fc.arc(px, py, r, 0, Math.PI * 2); fc.fill(); }
  last = { x, y }; wiped = performance.now();
  frame.classList.add("is-wiped");
};
frame.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse" || e.buttons) { const r = fog.getBoundingClientRect(); wipe(e.clientX - r.left, e.clientY - r.top); } });
frame.addEventListener("pointerdown", (e) => { const r = fog.getBoundingClientRect(); last = null; wipe(e.clientX - r.left, e.clientY - r.top); });
frame.addEventListener("pointerleave", () => (last = null));
sizeFog(); addEventListener("resize", sizeFog);
// the fog creeps back a few seconds after you stop
let fogT = 0;

const loop = (t) => {
  if (heroOn) { place(); rain(); }
  if (!reduced && wiped && performance.now() - wiped > 2600 && t - fogT > 120) { fogT = t; paintFog(0.035); }
  requestAnimationFrame(loop);
};
requestAnimationFrame(loop);

// ---------- scroll ----------
if (!reduced) {
  const lenis = new Lenis({ duration: 1.1 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  gsap.from(".hero__copy > *", { y: 50, opacity: 0, duration: 1.3, ease: "expo.out", stagger: 0.08, delay: 0.2 });
  gsap.from(".dome", { y: 120, opacity: 0, duration: 1.6, ease: "expo.out", delay: 0.4 });
  gsap.to(".hero__copy", { yPercent: -30, opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.utils.toArray(".glass__copy > *, .cover header > *, .cover li, .claim h2, .quote h2, .form").forEach((el) =>
    gsap.from(el, { y: 44, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } }));
  gsap.fromTo(".claim__line i", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".claim", start: "top 70%", end: "bottom 60%", scrub: 0.6 } });
  gsap.utils.toArray(".claim__steps li").forEach((el, i) => ScrollTrigger.create({ trigger: ".claim", start: `top+=${i * 18}% 60%`, onEnter: () => el.classList.add("is-on"), onLeaveBack: () => el.classList.remove("is-on") }));
} else document.querySelectorAll(".claim__steps li").forEach((el) => el.classList.add("is-on"));

// ---------- quote: honest about being a demo ----------
document.getElementById("quote-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.currentTarget, note = f.querySelector(".form__note");
  const bad = [...f.elements].filter((el) => el.required && !el.checkValidity());
  f.querySelectorAll("input, select").forEach((el) => el.toggleAttribute("aria-invalid", bad.includes(el)));
  if (bad.length) { note.textContent = "Please add your postcode and choose your type of home."; bad[0].focus(); return; }
  note.textContent = "This is a concept build, so there's no real price. In a live site, you'd see your quote here in plain English.";
});
