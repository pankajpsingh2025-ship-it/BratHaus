"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { initQuality } from "@/components/three/quality";
import Mark from "@/components/ui/Mark";
import type { MarkPart } from "@/content/brand";
import s from "./Preloader.module.css";

// First visit per session, on the home page: a night screen where the solid gold mark assembles from
// its three parts (the main stroke rises, the pill slides in, the dot settles), while a 000–100
// counter follows the story really loading (fonts, the 3D code, the scene's first frames and anything
// its loaders fetch). At 100 the mark scales down into the header's logo. An inline script in the
// layout sets html.is-preloading before first paint; reduced motion, Save-Data, ?3d=off and repeat
// visits skip it.
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null), logo = useRef<HTMLDivElement>(null), count = useRef<HTMLSpanElement>(null);
  const part = useRef<Partial<Record<MarkPart, SVGPathElement | null>>>({});
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("is-preloading")) return;
    root.current?.setAttribute("data-on", "");
    const q = initQuality();
    const parts = { fonts: 0, code: q === "off" ? 1 : 0, ready: q === "off" ? 1 : 0, loads: q === "off" ? 1 : 0 };
    const W = { fonts: 0.25, code: 0.25, ready: 0.3, loads: 0.2 };
    document.fonts.ready.then(() => { parts.fonts = 1; });
    if (q !== "off") import("@/components/story/StoryScene").then(() => { parts.code = 1; }).catch(() => { parts.code = 1; });
    const onReady = () => { parts.ready = 1; setTimeout(() => { if (parts.loads < 1) parts.loads = 1; }, 400); };
    const onLoads = (e: Event) => { const d = (e as CustomEvent<{ progress: number; active: boolean }>).detail; parts.loads = d.active ? d.progress / 100 : 1; };
    addEventListener("bh:story-ready", onReady);
    addEventListener("bh:3d-progress", onLoads);

    // the mark assembles: main rises 24px and fades in, the pill slides in from 32px right, the dot
    // scales 0.6 → 1 (1.1s in all, expo.out, stagger 0.12)
    const { main, pill, dot } = part.current;
    const assemble = gsap.timeline({ defaults: { duration: 0.86, ease: "expo.out" } })
      .fromTo(main ?? [], { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, 0)
      .fromTo(pill ?? [], { x: 32, autoAlpha: 0 }, { x: 0, autoAlpha: 1 }, 0.12)
      .fromTo(dot ?? [], { scale: 0.6, autoAlpha: 0, transformOrigin: "50% 50%" }, { scale: 1, autoAlpha: 1 }, 0.24);

    const start = performance.now();
    let shown = 0, raf = 0, done = false;
    const finish = () => {
      done = true;
      const target = document.querySelector<HTMLElement>("[data-chrome] .lockup__mark");
      const from = logo.current?.getBoundingClientRect();
      const to = target?.getBoundingClientRect();
      const tl = gsap.timeline({ defaults: { ease: "expo.inOut" } });
      tl.to(count.current, { autoAlpha: 0, duration: 0.4, ease: "power2.out" });
      if (from && to && from.height) {
        tl.to(logo.current, { x: to.left + to.width / 2 - (from.left + from.width / 2), y: to.top + to.height / 2 - (from.top + from.height / 2), scale: to.height / from.height, duration: 0.9 }, 0.15);
      }
      tl.add(() => {
        html.classList.remove("is-preloading");
        try { sessionStorage.setItem("bh-pre", "1"); } catch {}
        dispatchEvent(new Event("bh:preloader-done"));
      });
      tl.to(root.current, { autoAlpha: 0, duration: 0.5, ease: "power2.inOut", onComplete: () => root.current?.removeAttribute("data-on") });
    };
    const loop = (now: number) => {
      const t = (now - start) / 1000;
      let target = W.fonts * parts.fonts + W.code * parts.code + W.ready * parts.ready + W.loads * parts.loads;
      if (t > 6) target = 1;                    // never keep anyone waiting
      target = Math.min(target, t / 1.4);       // the mark has time to assemble
      shown += (target - shown) * 0.12;
      if (target >= 1 && shown > 0.995) shown = 1;
      if (count.current) count.current.textContent = String(Math.floor(shown * 100)).padStart(3, "0");
      if (shown >= 1 && !done) { finish(); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); assemble.kill(); removeEventListener("bh:story-ready", onReady); removeEventListener("bh:3d-progress", onLoads); };
  }, []);
  return (
    <div ref={root} className={s.pre} aria-hidden="true" data-preloader>
      <div ref={logo} className={s.logo}><Mark height={88} partRef={(k) => (el) => { part.current[k] = el; }} /></div>
      <span ref={count} className={`${s.count} mono`} data-count>000</span>
      <span className="sr-only" role="status">Loading BratHaus</span>
    </div>
  );
}
