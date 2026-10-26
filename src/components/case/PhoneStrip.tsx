"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import type { Shot } from "@/content/projects";
import s from "./PhoneStrip.module.css";

// A strip of phone screens you drag (or step through with the buttons and arrow keys): "01 / 05".
export default function PhoneStrip({ shots }: { shots: Shot[] }) {
  const [i, setI] = useState(0);
  const start = useRef<number | null>(null);
  const n = shots.length, go = (k: number) => setI(Math.max(0, Math.min(n - 1, k)));
  const pad = (v: number) => String(v).padStart(2, "0");
  return (
    <div className={s.strip} aria-roledescription="carousel" aria-label="On the phone" onKeyDown={(e) => { if (e.key === "ArrowRight") go(i + 1); if (e.key === "ArrowLeft") go(i - 1); }}>
      <div className={s.view} data-cursor="DRAG"
        onPointerDown={(e) => { start.current = e.clientX; }}
        onPointerUp={(e) => { if (start.current === null) return; const dx = e.clientX - start.current; start.current = null; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); }}>
        <ul className={s.track} style={{ transform: `translateX(calc(${-i} * (var(--pw) + var(--pg))))` }}>
          {shots.map((shot, k) => (
            <li key={shot.src} className={k === i ? s.on : ""} aria-hidden={k !== i}>
              <div className={s.phone}><Image src={shot.src} alt={shot.alt} fill sizes="300px" style={{ objectFit: "cover", objectPosition: "top" }} /></div>
            </li>
          ))}
        </ul>
      </div>
      <div className={s.ctrl}>
        <button type="button" className={s.btn} onClick={() => go(i - 1)} disabled={i === 0} aria-label="Previous screen">←</button>
        <p className="mono" aria-live="polite"><b>{pad(i + 1)}</b> / {pad(n)}</p>
        <button type="button" className={s.btn} onClick={() => go(i + 1)} disabled={i === n - 1} aria-label="Next screen">→</button>
      </div>
    </div>
  );
}
