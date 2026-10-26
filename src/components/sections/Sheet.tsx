"use client";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import s from "./Sheet.module.css";

// A day section. Normal flow: its 24px rounded top corner tucks over the section before, and while
// it arrives the section before drifts up a little (yPercent 0 → −6) for depth. Nothing is ever
// covered before it has been read.
// Layout rule: the section carries padding and colour only. Any grid lives on the inner wrapper
// (innerClassName): a grid on the section would make the one inner div its only, 1-column item.
type Props = {
  id?: string;
  theme?: "ivory" | "night";
  /** classes for the section itself: padding and background only, never a grid */
  className?: string;
  /** classes for the inner wrapper: this is where a grid (or any layout) goes */
  innerClassName?: string;
  style?: CSSProperties;
  children: ReactNode;
  /** retired: the gold gutter line (kept so call sites stay valid; nothing is drawn) */
  thread?: boolean | { from: "left" | "right"; to: "left" | "right" } | "none";
  labelledBy?: string;
  label?: string;
  /** false: a plain section, no tucked corner or drift */
  stack?: boolean;
};

export default function Sheet({ id, theme = "ivory", className = "", innerClassName = "", style, children, labelledBy, label, stack = true }: Props) {
  const el = useRef<HTMLElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const node = el.current; if (!node || !stack || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // depth: this section's content drifts up as the next section arrives
    let next = node.nextElementSibling as HTMLElement | null;
    while (next && !next.classList.contains("sheet") && next.tagName !== "SECTION") next = next.nextElementSibling as HTMLElement | null;
    if (!next) next = document.querySelector<HTMLElement>("footer[data-theme]");
    if (next && inner.current) gsap.fromTo(inner.current, { yPercent: 0 }, { yPercent: -6, ease: "none", scrollTrigger: { trigger: next, start: "top bottom", end: "top top", scrub: true } });
  }, { scope: el, dependencies: [stack] });

  return (
    <section ref={el} id={id} className={`${stack ? `sheet ${s.sheet}` : s.flat} on-${theme} ${className}`} style={style} data-theme={theme} aria-labelledby={labelledBy} aria-label={label}>
      <div ref={inner} className={`sheet__inner ${s.inner} ${innerClassName}`}>{children}</div>
    </section>
  );
}
