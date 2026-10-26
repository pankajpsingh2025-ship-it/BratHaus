"use client";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

// Media that reveals with a clip: inset(12%) → full, while easing from 1.08 to 1.
export default function ClipMedia({ src, alt, ratio = "16 / 10", sizes = "(max-width: 1440px) 100vw, 1320px", priority = false }: { src: string; alt: string; ratio?: string; sizes?: string; priority?: boolean }) {
  const box = useRef<HTMLDivElement>(null), inner = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (!box.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const st = { trigger: box.current, start: "top 92%", end: "top 35%", scrub: 0.6 };
    gsap.fromTo(box.current, { clipPath: "inset(12% 12% 12% 12% round 16px)" }, { clipPath: "inset(0% 0% 0% 0% round 16px)", ease: "power2.out", scrollTrigger: st });
    gsap.fromTo(inner.current, { scale: 1.08 }, { scale: 1, ease: "power2.out", scrollTrigger: st });
  }, { scope: box });
  return (
    <div ref={box} className="media" style={{ aspectRatio: ratio }}>
      <div ref={inner} style={{ position: "absolute", inset: 0 }}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} style={{ objectFit: "cover" }} />
      </div>
    </div>
  );
}
