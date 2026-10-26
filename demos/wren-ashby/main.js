// Wren & Ashby: a concept build by BratHaus.
// Scroll pushes the camera through the front door; rooms run sideways;
// a slider moves the house through the day.
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource-variable/bricolage-grotesque/standard.css";
import "./style.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

// the zoom must land on the front door whatever the screen's shape: find where the door
// sits once the photo is cropped to cover the screen (the door is at 56.7% / 66% of the photo)
const DOOR = { x: 0.567, y: 0.66 }, PHOTO = 16 / 9;
const aimDoor = () => {
  const img = document.querySelector(".door__img img"); if (!img) return;
  const W = img.clientWidth, H = img.clientHeight;
  const w = W / H > PHOTO ? W : H * PHOTO, h = W / H > PHOTO ? W / PHOTO : H;
  img.style.setProperty("--ox", `${W / 2 + (DOOR.x - 0.5) * w}px`);
  img.style.setProperty("--oy", `${H / 2 + (DOOR.y - 0.5) * h}px`);
};
aimDoor();
addEventListener("resize", aimDoor);

if (!reduced) {
  const lenis = new Lenis({ duration: 1.1 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // 1. through the front door: the street zooms into the door, the copy steps aside, the hall glows
  gsap.timeline({ scrollTrigger: { trigger: ".door", start: "top top", end: "bottom bottom", scrub: 0.8 } })
    .to(".door__copy", { opacity: 0, y: -40, duration: 0.2 }, 0.05)
    .to(".door__img img", { scale: 7.5, duration: 0.75, ease: "power2.in" }, 0.08)
    .to(".door__veil", { opacity: 1, duration: 0.2 }, 0.62)
    .fromTo(".door__inside", { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.18 }, 0.72);

  // 2. room by room, sideways
  const track = document.querySelector(".rooms__track");
  gsap.to(track, {
    x: () => -(track.scrollWidth - innerWidth + 80),
    ease: "none",
    scrollTrigger: { trigger: ".rooms", start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true },
  });
  gsap.utils.toArray(".room svg path, .room svg circle, .room svg rect").forEach((el) => {
    const len = el.getTotalLength ? el.getTotalLength() : 400;
    gsap.fromTo(el, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, ease: "none",
      scrollTrigger: { trigger: ".rooms", start: "top 60%", end: "bottom bottom", scrub: 1 } });
  });

  // 3-5. quiet reveals
  gsap.utils.toArray(".light__copy > *, .homes header > *, .home, .value > div > *, .form").forEach((el) =>
    gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } }));
} else {
  document.documentElement.classList.add("reduced");
}

// the nav turns light once you're past the street
ScrollTrigger.create({ trigger: ".rooms", start: "top 80px", onToggle: () => {}, onEnter: () => document.querySelector(".nav").classList.add("is-light"), onLeaveBack: () => document.querySelector(".nav").classList.remove("is-light") });

// the light: morning → noon → golden hour → dusk; windows glow after sunset
const hour = document.getElementById("hour"), out = document.getElementById("hour-out");
const frame = document.querySelector(".light__frame");
const mix = (a, b, t) => a + (b - a) * t;
const setHour = () => {
  const h = +hour.value;
  const t = (h - 7) / 15; // 0 morning … 1 night
  const dusk = Math.max(0, Math.min(1, (h - 17.5) / 3.5));
  const gold = Math.max(0, 1 - Math.abs(h - 18) / 2.5);
  frame.style.setProperty("--b", mix(1.08, 0.42, dusk * dusk).toFixed(3));
  frame.style.setProperty("--warm", (gold * 0.6 + t * 0.15).toFixed(3));
  frame.style.setProperty("--night", dusk.toFixed(3));
  frame.style.setProperty("--glow", Math.max(0, (h - 18.5) / 2).toFixed(3));
  const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
  out.textContent = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  hour.setAttribute("aria-valuetext", `${out.textContent}, ${h < 11 ? "morning" : h < 16 ? "afternoon" : h < 19 ? "golden hour" : "evening"}`);
};
hour.addEventListener("input", setHour);
setHour();
// a gentle demo of the day passing the first time the section comes into view
if (!reduced) ScrollTrigger.create({ trigger: ".light", start: "top 55%", once: true,
  onEnter: () => gsap.fromTo(hour, { value: 7 }, { value: 19.5, duration: 3.2, ease: "power2.inOut", onUpdate: setHour }) });

// the valuation form: honest about being a demo
document.getElementById("value-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.currentTarget, note = f.querySelector(".form__note");
  const bad = [...f.elements].filter((el) => el.required && !el.checkValidity());
  bad.forEach((el) => el.setAttribute("aria-invalid", "true"));
  f.querySelectorAll("input").forEach((el) => !bad.includes(el) && el.removeAttribute("aria-invalid"));
  if (bad.length) { note.textContent = "Please fill in your name, a valid email and your postcode."; bad[0].focus(); return; }
  note.textContent = "This is a concept build, so nothing was sent. In a live site, this would book your valuation and reply to you straight away.";
});
