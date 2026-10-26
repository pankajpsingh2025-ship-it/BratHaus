"use client";
import { useEffect, useRef } from "react";
import s from "./Cursor.module.css";

// The native cursor everywhere. Only over 3D objects and media ([data-cursor]) a small label
// appears beside it: "VIEW", "TRY IT LIVE". Fine pointers only.
export default function Cursor() {
  const el = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let raf = 0, x = 0, y = 0;
    const draw = () => { raf = 0; if (el.current) el.current.style.transform = `translate3d(${x + 16}px, ${y + 18}px, 0)`; };
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      const host = (e.target as Element).closest?.("[data-cursor]") as HTMLElement | null;
      const label = host?.dataset.cursor || "";
      if (el.current) {
        if (label && el.current.textContent !== label) el.current.textContent = label;
        el.current.classList.toggle(s.on, Boolean(label));
      }
      if (!raf) raf = requestAnimationFrame(draw);
    };
    addEventListener("pointermove", move, { passive: true });
    return () => { removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, []);
  return <span ref={el} className={`${s.label} mono`} aria-hidden="true" />;
}
