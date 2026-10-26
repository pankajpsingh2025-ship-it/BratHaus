"use client";
import { useEffect, useRef } from "react";

// A muted, looping, inline background video that only plays while it's on screen (and `active`),
// and never plays with reduced motion: then its poster simply stays. Decorative (aria-hidden).
export default function AutoVideo({ src, poster, className, active = true }: { src: string; poster?: string; className?: string; active?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current; if (!v) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)");
    let seen = false;
    const sync = () => { if (seen && active && !still.matches && !document.hidden) v.play().catch(() => {}); else v.pause(); };
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; sync(); }, { threshold: 0.01 });
    io.observe(v);
    still.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => { io.disconnect(); still.removeEventListener("change", sync); document.removeEventListener("visibilitychange", sync); v.pause(); };
  }, [active]);
  return <video ref={ref} className={className} src={src} poster={poster} muted loop playsInline preload="metadata" aria-hidden="true" />;
}
