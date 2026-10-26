// Aurelith: a concept build by BratHaus.
// A real-time 18k gold ring with a brilliant-cut diamond: it spins in, tilts to
// the pointer, and travels with the scroll through the collection and the craft.
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource-variable/bricolage-grotesque/standard.css";
import "./style.css";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const small = innerWidth < 760;

// ---------- the ring ----------
const canvas = document.querySelector(".gl");
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" }); }
catch { canvas.remove(); }

const ring = new THREE.Group(), tilt = new THREE.Group();
const state = { x: 0.24, y: 0, s: 1, rx: 0.5, ry: 0, spin: 0 };
if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50); camera.position.set(0, 0, 9);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // the band: a rounded comfort-fit profile turned on a lathe
  const prof = [];
  const R = 1.0, w = 0.2, t = 0.13;
  for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI * 2; prof.push(new THREE.Vector2(R + t + Math.cos(a) * t * 0.95, Math.sin(a) * w)); }
  const band = new THREE.Mesh(new THREE.LatheGeometry(prof, 160), new THREE.MeshPhysicalMaterial({ color: "#e6c186", metalness: 1, roughness: 0.16, clearcoat: 0.4, clearcoatRoughness: 0.1 }));
  band.rotation.x = Math.PI / 2;
  // the head: four claws and a brilliant-cut diamond
  const head = new THREE.Group(); head.position.y = R + t * 2.2;
  const gold = band.material;
  for (let k = 0; k < 4; k++) {
    const claw = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.045, 0.5, 12), gold);
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    claw.position.set(Math.cos(a) * 0.2, 0.08, Math.sin(a) * 0.2); claw.rotation.z = -Math.cos(a) * 0.25; claw.rotation.x = Math.sin(a) * 0.25;
    head.add(claw);
  }
  // brilliant cut: crown + pavilion as a faceted lathe
  const cut = [new THREE.Vector2(0, -0.34), new THREE.Vector2(0.27, -0.02), new THREE.Vector2(0.29, 0), new THREE.Vector2(0.2, 0.12), new THREE.Vector2(0.13, 0.15), new THREE.Vector2(0, 0.15)];
  const gem = new THREE.Mesh(new THREE.LatheGeometry(cut, 16), new THREE.MeshPhysicalMaterial({ color: "#ffffff", metalness: 0, roughness: 0, transmission: 1, thickness: 0.6, ior: 2.42, dispersion: 0.6, envMapIntensity: 2.4, flatShading: true, specularIntensity: 1 }));
  gem.position.y = 0.26;
  head.add(gem);
  ring.add(band, head);
  tilt.add(ring); scene.add(tilt);
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const key = new THREE.DirectionalLight(0xfff3e0, 2.2); key.position.set(3, 5, 6); scene.add(key);

  const size = () => {
    const W = innerWidth, H = innerHeight;
    renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
  };
  size(); addEventListener("resize", size);

  const p = new THREE.Vector2(), pt = new THREE.Vector2();
  addEventListener("pointermove", (e) => pt.set((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1));
  const vis = () => { const h = camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)); return { h, w: h * camera.aspect }; };
  let last = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    p.lerp(pt, 1 - Math.exp(-dt * 3));
    const v = vis();
    // phones: smaller, and kept in the lower part of the screen, clear of the copy
    tilt.position.set(state.x * v.w * 2 * (small ? 0.2 : 1), small ? -v.h * 0.6 + state.y * v.h * 0.3 : state.y * v.h, 0);
    tilt.scale.setScalar(state.s * (small ? 0.48 : 1));
    tilt.rotation.set(state.rx + p.y * 0.25, state.ry + p.x * 0.4, 0);
    if (!reduced) state.spin += dt * 0.35;
    ring.rotation.y = state.spin;
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

// ---------- scroll choreography ----------
if (!reduced) {
  const lenis = new Lenis({ duration: 1.15 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);

  // it arrives spinning
  gsap.from(state, { s: 0.2, spin: -Math.PI * 3, duration: 2.6, ease: "expo.out" });
  gsap.from(".hero__word", { yPercent: 40, opacity: 0, duration: 1.6, ease: "expo.out" });
  gsap.from(".hero__line, .hero__hint, .hero .kicker", { y: 30, opacity: 0, duration: 1.2, ease: "expo.out", stagger: 0.1, delay: 0.4 });

  // then it travels: beside the collection, edge-on through the craft, small by the consultation
  const tl = gsap.timeline({ scrollTrigger: { trigger: "main", start: "top top", end: "bottom bottom", scrub: 1 } });
  // the nav reads light while it sits over the dark craft section
  ScrollTrigger.create({ trigger: ".craft", start: "top 60px", end: "bottom 60px", toggleClass: { targets: ".nav", className: "is-dark" } });
  tl.to(state, { x: -0.3, y: -0.12, s: 0.7, rx: 0.9, ry: 0.6, duration: 1, ease: "power2.inOut" })
    .to(state, { x: 0.2, y: 0.22, s: 0.55, rx: 1.45, ry: 0, duration: 1, ease: "power2.inOut" })
    .to(state, { x: 0.36, y: 0.3, s: 0.36, rx: 0.4, ry: -0.4, duration: 1, ease: "power2.inOut" }); // a small sign-off above the form, clear of the headline

  // the gold thread draws itself through the craft
  const path = document.querySelector(".thread path"), len = path.getTotalLength();
  gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ".craft", start: "top top", end: "bottom bottom", scrub: 0.8 } });
  gsap.utils.toArray(".craft__steps li").forEach((el, i) => ScrollTrigger.create({ trigger: ".craft", start: `top+=${8 + i * 20}% top`, onEnter: () => el.classList.add("is-on"), onLeaveBack: () => el.classList.remove("is-on") }));
  gsap.utils.toArray(".collection__copy > *, .fan li, .consult h2, .form").forEach((el) =>
    gsap.from(el, { y: 50, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } }));
} else document.querySelectorAll(".craft__steps li").forEach((el) => el.classList.add("is-on"));

// ---------- consultation: honest about being a demo ----------
document.getElementById("consult-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.currentTarget, note = f.querySelector(".form__note");
  const bad = [...f.elements].filter((el) => el.required && !el.checkValidity());
  f.querySelectorAll("input, select").forEach((el) => el.toggleAttribute("aria-invalid", bad.includes(el)));
  if (bad.length) { note.textContent = "Please add your name, a valid email and what you have in mind."; bad[0].focus(); return; }
  note.textContent = "This is a concept build, so nothing was sent. In a live site, you'd be offered a time with the atelier straight away.";
});
