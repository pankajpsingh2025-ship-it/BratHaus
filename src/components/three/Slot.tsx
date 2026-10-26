"use client";
import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { queueTurn, useQuality, type Quality } from "./quality";

type Ctx = { el: RefObject<HTMLDivElement | null>; quality: Quality; lite: boolean; ready: () => void; shown?: boolean };
export const SlotCtx = createContext<Ctx | null>(null);
export const useSlot = () => {
  const c = useContext(SlotCtx);
  if (!c) throw new Error("useSlot outside <Slot>");
  return c;
};

// A fixed-size box where a 3D moment appears. Until the 3D is ready (or when quality is
// "off"), it shows the still image or the fallback, so there's never layout shift or a blank box.
// The 3D chunk only loads when the box is near the screen.
export default function Slot({ poster, fallback, className = "", style, cursor, label, children, margin = "60% 0px" }: {
  poster?: string | null; fallback?: ReactNode; className?: string; style?: CSSProperties; cursor?: string; label?: string; children: ReactNode; margin?: string;
}) {
  const el = useRef<HTMLDivElement>(null);
  const quality = useQuality();
  const [near, setNear] = useState(false);
  const [isReady, setReady] = useState(false);
  const [posterOk, setPosterOk] = useState(true);
  const [turn, setTurn] = useState(false);
  useEffect(() => {
    const node = el.current; if (!node) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: margin });
    io.observe(node);
    return () => io.disconnect();
  }, [margin]);
  const capable = quality === "high" || quality === "lite";
  useEffect(() => (near && capable && !turn ? queueTurn(() => setTurn(true)) : undefined), [near, capable, turn]);
  const live = near && capable && turn;
  return (
    <div ref={el} className={`slot ${className} ${live && isReady ? "is-live" : ""}`} style={style} data-cursor={live && cursor ? cursor : undefined}
      role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {(
        <div className="slot__still" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {poster && posterOk ? <img src={poster} alt="" loading="lazy" decoding="async" onError={() => setPosterOk(false)} /> : fallback}
        </div>
      )}
      {live && <SlotCtx.Provider value={{ el, quality, lite: quality === "lite", ready: () => setReady(true) }}>{children}</SlotCtx.Provider>}
    </div>
  );
}
