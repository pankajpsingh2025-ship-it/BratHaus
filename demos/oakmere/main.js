// Oakmere Dental: a concept build by BratHaus.
// The AI receptionist is scripted (it says so), but you can really use it:
// pick a question or type one, it types back, offers slots, and holds one.
import "@fontsource-variable/bricolage-grotesque/standard.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "./style.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- the receptionist ----------
const log = document.querySelector(".rx__log"), chips = document.querySelector(".rx__chips");
const form = document.querySelector(".rx__form"), input = document.getElementById("rx-input");
const day = (offset) => new Date(Date.now() + offset * 864e5).toLocaleDateString("en-GB", { weekday: "short" });

const INTENTS = [
  { id: "emergency", chip: "I've chipped a tooth", keys: ["chip", "broke", "broken", "pain", "toothache", "hurts", "emergency", "swollen", "ache"],
    say: "Sorry to hear that. We keep emergency slots free every day. These are the soonest:", slots: () => [`Today 16:40`, `Today 18:10`, `${day(1)} 08:30`] },
  { id: "checkup", chip: "Book a check-up", keys: ["check", "checkup", "check-up", "appointment", "book", "routine", "exam"],
    say: "Of course. Morning, lunchtime or evening? Here are the next free check-ups:", slots: () => [`${day(1)} 09:30`, `${day(2)} 12:45`, `${day(3)} 18:20`] },
  { id: "new", chip: "Do you take new patients?", keys: ["new patient", "register", "join", "taking", "accept"],
    say: "Yes, we're welcoming new patients now. Your first visit is a full check-up. Shall I find you a time?", next: ["checkup"] },
  { id: "price", chip: "How much is whitening?", keys: ["price", "cost", "how much", "whitening", "fee", "£"],
    say: "Prices depend on the plan, so we confirm them at a free consultation. I can book you one in a few seconds.", next: ["checkup"] },
  { id: "hours", chip: "When are you open?", keys: ["open", "hours", "evening", "weekend", "saturday", "late"],
    say: "The practice is open 8:00 to 20:00 on weekdays and Saturday mornings. I'm here around the clock to book or answer questions." },
];
const FALLBACK = { say: "Good question. I'll pass that to the team and they'll reply first thing. Can I book you in meanwhile?", next: ["checkup", "emergency"] };
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const match = (text) => INTENTS.find((i) => i.keys.some((k) => new RegExp(/^\w/.test(k) ? `\\b${esc(k)}` : esc(k), "i").test(text))) || FALLBACK;

let busy = false;
const scroll = () => log.scrollTo({ top: log.scrollHeight, behavior: reduced ? "auto" : "smooth" });
const bubble = (who, html) => { const p = document.createElement("div"); p.className = `rx__msg rx__msg--${who}`; p.innerHTML = html; log.append(p); scroll(); return p; };
const say = (text, after) => {
  busy = true;
  const t = bubble("bot", '<span class="rx__typing"><i></i><i></i><i></i></span>');
  t.setAttribute("aria-label", "The receptionist is typing");
  setTimeout(() => { t.removeAttribute("aria-label"); t.textContent = text; busy = false; after?.(); scroll(); }, reduced ? 50 : 650 + Math.min(1200, text.length * 12));
};
const offerSlots = (list) => {
  const row = document.createElement("div"); row.className = "rx__slots";
  list.forEach((s) => { const b = document.createElement("button"); b.type = "button"; b.textContent = s; b.onclick = () => hold(s, row); row.append(b); });
  log.append(row); scroll();
};
const hold = (slot, row) => {
  if (busy) return;
  row.querySelectorAll("button").forEach((b) => { b.disabled = true; b.classList.toggle("is-on", b.textContent === slot); });
  bubble("you", slot);
  say(`Held for you: ${slot}. In the live version you'd get a text to confirm, plus a reminder the day before.`, () => {
    const c = document.createElement("div"); c.className = "rx__card";
    c.innerHTML = `<b>✓ ${slot}</b><span>Oakmere Dental · Demo only, nothing booked</span>`;
    log.append(c); scroll(); renderChips();
  });
};
const answer = (intent) => say(intent.say, () => { if (intent.slots) offerSlots(intent.slots()); renderChips(intent.next); });
const ask = (text) => {
  const q = text.trim(); if (!q || busy) return;
  bubble("you", q.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]));
  answer(match(q));
};
const renderChips = (ids) => {
  chips.innerHTML = "";
  const list = ids ? INTENTS.filter((i) => ids.includes(i.id)) : INTENTS.slice(0, 4);
  list.forEach((i) => { const b = document.createElement("button"); b.type = "button"; b.textContent = i.chip; b.onclick = () => ask(i.chip); chips.append(b); });
};
form.addEventListener("submit", (e) => { e.preventDefault(); ask(input.value); input.value = ""; });
bubble("bot", "Hi, I'm Oakmere's receptionist. I can book appointments, find emergency slots and answer questions, any time of day.");
renderChips();

// ---------- motion ----------
if (!reduced) {
  const lenis = new Lenis({ duration: 1.1 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  gsap.from(".hero__copy > *", { y: 40, opacity: 0, duration: 1.2, ease: "expo.out", stagger: 0.08, delay: 0.1 });
  gsap.from(".rx", { y: 60, opacity: 0, rotate: 1.5, duration: 1.4, ease: "expo.out", delay: 0.35 });
  gsap.utils.toArray(".night__copy > *, .treat header > *, .treat__grid li, .how h2, .book > div > *, .form").forEach((el) =>
    gsap.from(el, { y: 40, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } }));
  gsap.fromTo(".night__photo img", { scale: 1.18 }, { scale: 1.02, ease: "none", scrollTrigger: { trigger: ".night", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.utils.toArray(".night__log li").forEach((el, i) =>
    gsap.from(el, { x: 40, opacity: 0, duration: 0.9, ease: "expo.out", delay: i * 0.12, scrollTrigger: { trigger: ".night__log", start: "top 75%" } }));
  gsap.fromTo(".how__steps", { "--line": 0 }, { "--line": 1, ease: "none", scrollTrigger: { trigger: ".how", start: "top 70%", end: "bottom 70%", scrub: 0.6 } });
  gsap.utils.toArray(".how__steps li").forEach((el, i) => ScrollTrigger.create({ trigger: ".how", start: `top+=${i * 16}% 62%`, onEnter: () => el.classList.add("is-on"), onLeaveBack: () => el.classList.remove("is-on") }));
} else document.querySelectorAll(".how__steps li").forEach((el) => el.classList.add("is-on"));

// ---------- the new-patient form: honest about being a demo ----------
document.getElementById("book-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.currentTarget, note = f.querySelector(".form__note");
  const bad = [...f.elements].filter((el) => el.required && !el.checkValidity());
  f.querySelectorAll("input, select").forEach((el) => el.toggleAttribute("aria-invalid", bad.includes(el)));
  if (bad.length) { note.textContent = "Please add your name, a mobile number and what you'd like."; bad[0].focus(); return; }
  note.textContent = "This is a concept build, so nothing was sent. In the live version, the receptionist would text you your first appointment within seconds.";
});
