"use client";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { process, type Step } from "@/content/process";
import Reveal from "@/components/ui/Reveal";
import Sheet from "./Sheet";
import s from "./ProcessTray.module.css";

// "From first call to first booking": a recessed night tray, held while five paper cards travel
// sideways through it. Each card's small gold line drawing plays when it reaches the middle.
function Art({ kind }: { kind: Step["art"] }) {
  const d: Record<Step["art"], string[]> = {
    call: ["M44 70 C44 52 56 40 74 40 L86 40 L94 58 L84 66 C88 78 98 88 110 92 L118 82 L136 90 L136 102 C136 120 124 132 106 132 C70 132 44 106 44 70 Z"],
    plan: ["M90 34 L90 58", "M50 58 L130 58", "M50 58 L50 82", "M90 58 L90 82", "M130 58 L130 82", "M38 82 L62 82 L62 104 L38 104 Z", "M78 82 L102 82 L102 104 L78 104 Z", "M118 82 L142 82 L142 104 L118 104 Z", "M76 22 L104 22 L104 34 L76 34 Z", "M38 120 L62 120 M78 120 L102 120 M118 120 L142 120"],
    build: ["M30 30 L150 30 L150 130 L30 130 Z", "M30 46 L150 46", "M44 60 L100 60", "M44 72 L86 72", "M44 86 L70 86 L70 98 L44 98 Z", "M108 58 L138 58 L138 98 L108 98 Z", "M44 110 L136 110 M44 118 L120 118"],
    launch: ["M40 70 C40 58 50 48 62 48 L118 48 C130 48 140 58 140 70 C140 82 130 92 118 92 L62 92 C50 92 40 82 40 70 Z", "M118 70 m-16 0 a16 16 0 1 0 32 0 a16 16 0 1 0 -32 0", "M58 70 L84 70", "M90 116 L90 128 M70 112 L62 122 M110 112 L118 122"],
    grow: ["M30 126 L150 126", "M30 126 L30 30", "M40 112 C64 108 72 92 90 88 C108 84 116 64 140 44", "M126 44 L140 44 L140 58"],
  };
  return (
    <svg viewBox="0 0 180 160" className={s.art} aria-hidden="true">
      {d[kind].map((p, i) => <path key={i} d={p} pathLength={1} />)}
    </svg>
  );
}

// tone "light": a recessed paper tray instead of a night one (the Studio page has no dark trays)
export default function ProcessTray({ id = "process", bookingUrl, tone = "night" }: { id?: string; bookingUrl: string; tone?: "night" | "light" }) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  useGSAP(() => {
    const el = root.current, tr = track.current; if (!el || !tr) return;
    const cards = gsap.utils.toArray<HTMLElement>(tr.querySelectorAll("[data-card]"));
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const distance = () => Math.max(0, tr.scrollWidth - tr.parentElement!.clientWidth);
    el.style.setProperty("--travel", `${distance()}px`);
    const light = () => {
      const mid = innerWidth / 2;
      cards.forEach((c) => { const r = c.getBoundingClientRect(); c.classList.toggle(s.on, r.left < mid + r.width * 0.6 && r.right > mid - r.width * 0.6); });
    };
    if (reduce) { cards.forEach((c) => c.classList.add(s.on)); return; }
    const tween = gsap.to(tr, {
      x: () => -distance(), ease: "none",
      scrollTrigger: {
        trigger: el, start: "top top", end: () => `+=${distance()}`, scrub: 0.6, invalidateOnRefresh: true,
        onUpdate: light, onRefresh: () => { el.style.setProperty("--travel", `${distance()}px`); light(); },
      },
    });
    light();
    ScrollTrigger.refresh();
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, { scope: root });
  const book = bookingUrl || "/contact";
  return (
    <Sheet id={id} thread={{ from: "right", to: "left" }} labelledBy={`${id}-title`}>
      <div ref={root} className={s.hold}>
        <div className={s.pin}>
          <div className={`${s.head} page`}>
            <Reveal id={`${id}-title`} className="t-h2">From first call to first booking.</Reveal>
          </div>
          <div className={`${s.tray} ${tone === "light" ? `${s.light} on-ivory` : "on-night"}`}>
            <ol ref={track} className={s.track}>
              {process.map((p) => (
                <li key={p.n} className={s.card} data-card>
                  <span className={`mono ${s.num}`}>{p.n}</span>
                  <Art kind={p.art} />
                  <span className={s.cardTitle}>{p.title}</span>
                  <span className={s.cardText}>{p.text}</span>
                </li>
              ))}
              <li className={s.final}>
                <p className="t-h2">Your first enquiries, answered from day one.</p>
                <a className="btn" href={book} {...(book.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}>Book a 20-minute call <span className="arr" aria-hidden="true">→</span></a>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
