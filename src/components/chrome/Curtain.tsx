"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useLenis } from "@/lib/lenis";
import { setPaused } from "@/components/three/quality";
import Mark from "@/components/ui/Mark";
import { setTransitionHandler } from "./transition";
import s from "./Curtain.module.css";

// Page changes: a night panel wipes up (0.5s) while the solid gold mark settles in its centre, the
// route changes underneath, then the panel wipes away. No WebGL work while covered.
export default function Curtain() {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const panel = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLSpanElement>(null);
  const pending = useRef<string | null>(null);
  const busy = useRef(false);

  useEffect(() => {
    const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
    const run = (href: string) => {
      const url = new URL(href, location.href);
      if (url.pathname === location.pathname) {
        const t = url.hash ? document.querySelector(url.hash) : null;
        if (t) { if (lenis) lenis.scrollTo(t as HTMLElement, { offset: -80 }); else t.scrollIntoView(); }
        return;
      }
      if (reduce() || busy.current) { router.push(url.pathname + url.search + url.hash); return; }
      busy.current = true;
      pending.current = url.pathname + url.search + url.hash;
      gsap.timeline()
        .set(panel.current, { yPercent: 100, visibility: "visible" })
        .set(mark.current, { autoAlpha: 0, y: 12, scale: 0.94 })
        .to(panel.current, { yPercent: 0, duration: 0.5, ease: "expo.inOut" })
        .to(mark.current, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "expo.out" }, "-=0.25")
        .add(() => { setPaused(true); router.push(pending.current!, { scroll: false }); });
    };
    setTransitionHandler(run);
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.dataset.noCurtain !== undefined) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || /^\/(demos|api)\//.test(url.pathname) || url.protocol === "mailto:") return;
      e.preventDefault();
      run(url.href);
    };
    document.addEventListener("click", onClick);
    return () => { document.removeEventListener("click", onClick); setTransitionHandler(null); };
  }, [router, lenis]);

  // the new page has mounted: top of the page (or its anchor), re-measure, wipe away
  useEffect(() => {
    if (!pending.current) return;
    const hash = pending.current.split("#")[1];
    pending.current = null;
    requestAnimationFrame(() => {
      const target = hash ? document.getElementById(hash) : null;
      if (lenis) lenis.scrollTo(target ?? 0, { immediate: true, force: true, offset: target ? -80 : 0 });
      else if (target) target.scrollIntoView(); else window.scrollTo(0, 0);
      ScrollTrigger.refresh();
      setPaused(false);
      gsap.to(panel.current, { yPercent: -100, duration: 0.6, ease: "expo.inOut", delay: 0.1, onComplete: () => { gsap.set(panel.current, { visibility: "hidden" }); busy.current = false; } });
    });
  }, [pathname, lenis]);

  return (
    <div ref={panel} className={s.curtain} aria-hidden="true">
      <span ref={mark} className={s.mark}><Mark height={64} /></span>
    </div>
  );
}
