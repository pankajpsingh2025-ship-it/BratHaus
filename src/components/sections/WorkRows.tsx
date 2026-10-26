"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import VideoCard from "@/components/shared/VideoCard";
import LiveModal from "@/components/shared/LiveModal";
import type { LiveBuild } from "@/components/shared/LivePreview";
import Mark from "@/components/ui/Mark";
import s from "./WorkRows.module.css";

export type WorkItem = {
  slug: string; name: string; line: string; sector: string; services: string[]; builtWith: string; kind: string; tags: string[];
  hero: string | null; heroAlt: string; phone: string | null; video: string | null; demo: string | null; poster: string | null;
};

// Alternating rows, one per project: the hero (clip reveal; the preview video on hover/focus) with
// the phone screen overlapping its corner, and a spec table with dotted rules. Every one is a
// concept build, and every one is live.
export default function WorkRows({ items }: { items: WorkItem[] }) {
  const root = useRef<HTMLOListElement>(null);
  const [live, setLive] = useState<LiveBuild | null>(null);
  const close = useCallback(() => setLive(null), []);
  useGSAP(() => {
    if (!root.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.utils.toArray<HTMLElement>(root.current.querySelectorAll("[data-reveal]")).forEach((m) => {
      gsap.fromTo(m, { clipPath: "inset(12% 12% 12% 12% round 16px)" }, { clipPath: "inset(0% 0% 0% 0% round 16px)", ease: "power2.out", scrollTrigger: { trigger: m, start: "top 92%", end: "top 40%", scrub: 0.6 } });
      const inner = m.querySelector("[data-scale]");
      if (inner) gsap.fromTo(inner, { scale: 1.08 }, { scale: 1, ease: "power2.out", scrollTrigger: { trigger: m, start: "top 92%", end: "top 40%", scrub: 0.6 } });
    });
    gsap.utils.toArray<HTMLElement>(root.current.querySelectorAll("[data-phone]")).forEach((p) => {
      gsap.fromTo(p, { y: 70 }, { y: -70, ease: "none", scrollTrigger: { trigger: p.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
  }, { scope: root, dependencies: [items.length] });
  return (
    <>
      <ol ref={root} className={s.rows}>
        {items.map((p, i) => (
          <li key={p.slug} className={`${s.row} ${i % 2 ? s.flip : ""}`}>
            <div className={s.visual}>
              <Link href={`/work/${p.slug}`} className={s.media} data-reveal data-cursor="VIEW" aria-label={`${p.name}: case study`}>
                <span className={s.scale} data-scale>
                  {p.hero
                    ? <VideoCard poster={p.hero} video={p.video} alt={p.heroAlt} sizes="(max-width: 860px) 100vw, 58vw" cursor="VIEW" />
                    : <span className="ph" aria-hidden="true"><Mark height={56} /></span>}
                </span>
              </Link>
              {p.phone && (
                <span className={s.phone} data-phone aria-hidden="true"><img src={p.phone} alt="" loading="lazy" decoding="async" /></span>
              )}
            </div>
            <div className={s.text}>
              <h3 className={s.name}>{p.name}</h3>
              <p className="soft">{p.line}</p>
              <dl className={s.spec}>
                <div><dt className="mono">Sector</dt><dd>{p.sector}</dd></div>
                <div><dt className="mono">Services</dt><dd>{p.services.join(" · ")}</dd></div>
                <div><dt className="mono">Built with</dt><dd>{p.builtWith}</dd></div>
                <div><dt className="mono">Status</dt><dd>{p.kind}</dd></div>
              </dl>
              <div className={s.actions}>
                <Link className="btn" href={`/work/${p.slug}`}>Case study <span className="arr" aria-hidden="true">→</span></Link>
                {p.demo && <button type="button" className="tlink" data-cursor="TRY IT LIVE" onClick={() => setLive({ name: p.name, demo: p.demo, video: p.video, poster: p.poster, kind: p.kind })}>Try it live</button>}
              </div>
            </div>
          </li>
        ))}
      </ol>
      <LiveModal build={live} onClose={close} />
    </>
  );
}
