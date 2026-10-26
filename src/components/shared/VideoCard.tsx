"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// A poster that cross-fades to the muted preview video on hover/focus (fine pointers),
// or when 60% in view on touch devices.
export default function VideoCard({ poster, video, alt, sizes = "50vw", cursor = "View", className = "" }: { poster: string; video?: string | null; alt: string; sizes?: string; cursor?: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null), vid = useRef<HTMLVideoElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = box.current; if (!el || !video) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      const host = el.closest("a, article") || el;
      const enter = () => setOn(true), leave = () => setOn(false);
      host.addEventListener("pointerenter", enter); host.addEventListener("pointerleave", leave);
      host.addEventListener("focusin", enter); host.addEventListener("focusout", leave);
      return () => { host.removeEventListener("pointerenter", enter); host.removeEventListener("pointerleave", leave); host.removeEventListener("focusin", enter); host.removeEventListener("focusout", leave); };
    }
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [video]);
  useEffect(() => { const v = vid.current; if (!v) return; if (on) { v.play().catch(() => {}); } else v.pause(); }, [on]);
  return (
    <div ref={box} className={`vcard ${on ? "is-on" : ""} ${className}`} data-cursor={cursor}>
      <Image src={poster} alt={alt} fill sizes={sizes} style={{ objectFit: "cover" }} />
      {video && <video ref={vid} src={video} muted loop playsInline preload="none" aria-hidden="true" />}
    </div>
  );
}
