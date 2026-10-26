"use client";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type Ref } from "react";
import s from "./DeviceFrame.module.css";

// A CSS device (no WebGL): a phone, a browser window or a laptop, holding the story's REAL device
// UI at its design size, laid out with CSS zoom at the frame's real width (so it's crisp at any
// size, and its text never drops below 12 real px: the UIs read --z). Optional CSS 3D tilt that
// eases flat on hover and leans a little towards the pointer.
const DESIGN = { phone: [390, 844], browser: [1280, 800], laptop: [1280, 800] } as const;
export type DeviceKind = keyof typeof DESIGN;

export default function DeviceFrame({ kind, children, className = "", tilt, uiRef, label }: {
  kind: DeviceKind; children: ReactNode; className?: string;
  /** lean: +1 turns it to face right, −1 left */
  tilt?: 1 | -1; uiRef?: Ref<HTMLDivElement>; label?: string;
}) {
  const [w, h] = DESIGN[kind];
  const screen = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [z, setZ] = useState(0);
  useEffect(() => {
    const el = screen.current; if (!el) return;
    const ro = new ResizeObserver(() => setZ(el.clientWidth / w));
    ro.observe(el);
    return () => ro.disconnect();
  }, [w]);
  // pointer lean (up to 4°), only with a fine pointer and motion allowed
  useEffect(() => {
    const el = frame.current; if (!el || !tilt) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--px", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      el.style.setProperty("--py", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    };
    const leave = () => { el.style.setProperty("--px", "0"); el.style.setProperty("--py", "0"); };
    el.addEventListener("pointermove", move); el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
  }, [tilt]);
  const size = z < 0.45 ? "s" : z < 0.7 ? "m" : "l";
  return (
    <div ref={frame} className={`${s.frame} ${s[kind]} ${tilt ? s.tilt : ""} ${className}`} style={{ "--lean": tilt ?? 0 } as CSSProperties} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <div className={s.body}>
        {kind === "browser" && <div className={s.bar}><i /><i /><i /></div>}
        <div ref={screen} className={s.screen} style={{ aspectRatio: `${w} / ${h}` }}>
          <div ref={uiRef} className="device-ui" data-size={size} style={{ width: w, height: h, zoom: z || 0.0001, "--z": z || 1, visibility: z ? "visible" : "hidden" } as CSSProperties}>{children}</div>
        </div>
      </div>
      {kind === "laptop" && <div className={s.base} />}
    </div>
  );
}
