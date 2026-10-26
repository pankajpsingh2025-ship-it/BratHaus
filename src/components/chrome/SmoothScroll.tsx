"use client";
import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis } from "@/lib/lenis";

// One Lenis instance on GSAP's ticker, so ScrollTrigger and smooth scroll share one clock.
// Touch keeps native scrolling. Off under reduced motion. Stopped while the menu or a dialog is open.
export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    addEventListener("bh:3d-ready", refresh);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => removeEventListener("bh:3d-ready", refresh);
    const l = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true, syncTouch: false });
    l.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => l.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const sync = () => (document.documentElement.classList.contains("menu-open") || document.querySelector("dialog[open]") ? l.stop() : l.start());
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });
    setLenis(l);
    return () => { removeEventListener("bh:3d-ready", refresh); gsap.ticker.remove(tick); mo.disconnect(); l.destroy(); setLenis(null); };
  }, []);
  return <>{children}</>;
}
