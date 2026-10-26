"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

// The Services hero's explainer: Ad → Website → AI agent → Dashboard, joined by a gold line that
// draws itself on load; each node pulses once as the line reaches it.
const NODES = [
  { x: 60, y: 250, label: "Ad" },
  { x: 200, y: 120, label: "Website" },
  { x: 360, y: 210, label: "AI agent" },
  { x: 500, y: 90, label: "Dashboard" },
];
const D = "M60 250 C110 250 150 120 200 120 S310 210 360 210 S450 90 500 90";

export default function JourneyLine() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const el = root.current; if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const q = gsap.utils.selector(el);
    const tl = gsap.timeline({ delay: 0.5 });
    tl.fromTo(q("[data-path]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut" });
    NODES.forEach((_, i) => {
      const at = (i / (NODES.length - 1)) * 2.2 * 0.92;
      tl.fromTo(q(`[data-node="${i}"] [data-dot]`), { scale: 0.4, opacity: 0.3 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(3)", transformOrigin: "50% 50%" }, at);
      tl.fromTo(q(`[data-node="${i}"] [data-ring]`), { scale: 1, opacity: 0.7 }, { scale: 2.6, opacity: 0, duration: 1.1, ease: "power2.out", transformOrigin: "50% 50%" }, at);
      tl.fromTo(q(`[data-label="${i}"]`), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }, at + 0.05);
    });
  }, { scope: root });
  // the labels are HTML (real text at a real size at any width), placed over the drawing
  return (
    <div ref={root} className="journey" role="img" aria-label="An ad leads to a website, the website to an AI agent, and the agent books into a dashboard.">
      <svg viewBox="0 0 560 330" aria-hidden="true">
        <path d={D} data-path pathLength={1} fill="none" stroke="#D4AF7C" strokeWidth="1.5" strokeDasharray="1" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {NODES.map((n, i) => (
          <g key={n.label} data-node={i} transform={`translate(${n.x} ${n.y})`}>
            <circle data-ring r="9" fill="none" stroke="#D4AF7C" strokeWidth="1" />
            <circle data-dot r="7" fill="#D4AF7C" />
          </g>
        ))}
      </svg>
      {NODES.map((n, i) => (
        <span key={n.label} data-label={i} className="journey__label mono" style={{ left: `${(n.x / 560) * 100}%`, top: `${((n.y + 22) / 330) * 100}%` }} aria-hidden="true">{n.label}</span>
      ))}
    </div>
  );
}
