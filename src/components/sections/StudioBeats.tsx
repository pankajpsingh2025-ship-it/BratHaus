"use client";
import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import DeviceFrame from "@/components/devices/DeviceFrame";
import DashboardScreen from "@/components/story/ui/DashboardScreen";
import Sheet from "./Sheet";
import s from "./StudioBeats.module.css";

// The Studio's story in three beats. Desktop: the left column is sticky (the beat's number, title and
// line swap as you scroll); the right column scrolls through three 80vh panels. Phones: stacked beats,
// visual then words.
const BEATS = [
  { n: "01", title: "Most businesses lose customers in the gaps.", line: "An agency for ads, someone else for the website, an inbox nobody answers after six. Every hand-off loses someone." },
  { n: "02", title: "So we built one team for all of it.", line: "Ads, website, AI agents and software are planned together and built to talk to each other." },
  { n: "03", title: "Everything we make has one job.", line: "Turn the people who find you into bookings in your diary." },
];
const TILES = [
  { k: "ad", label: "The ad" },
  { k: "site", label: "The website" },
  { k: "inbox", label: "The inbox" },
  { k: "diary", label: "The diary" },
];
// where each tile drifts to in beat 01 (x, y in % of the panel; a small turn)
const APART = [[-14, -16, -5], [10, -6, 4], [-8, 14, 3], [16, 20, -4]];

function Tile({ k, label }: { k: string; label: string }) {
  return (
    <div className={s.tile} data-tile>
      <div className={`${s.mini} ${s[k]}`} aria-hidden="true"><i /><i /><i /></div>
      <span className="mono">{label}</span>
    </div>
  );
}

export default function StudioBeats() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  useGSAP(() => {
    const el = root.current; if (!el) return;
    const q = gsap.utils.selector(el);
    const panels = q("[data-panel]") as HTMLElement[];
    const triggers = panels.map((p, i) => ScrollTrigger.create({ trigger: p, start: "top 55%", end: "bottom 55%", onToggle: (self) => { if (self.isActive) setActive(i); } }));
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => triggers.forEach((t) => t.kill());
    // beat 01: the four tiles drift apart (a little parallax as the panel passes)
    const apart = q("[data-panel='0'] [data-tile]") as HTMLElement[];
    apart.forEach((t, i) => gsap.fromTo(t, { xPercent: APART[i][0] * 0.4, yPercent: APART[i][1] * 0.4, rotate: 0 }, { xPercent: APART[i][0], yPercent: APART[i][1], rotate: APART[i][2], ease: "none", scrollTrigger: { trigger: panels[0], start: "top bottom", end: "bottom top", scrub: true } }));
    // beat 02: the same tiles snap together into one row, joined by the gold line (scrubbed)
    const join = q("[data-panel='1'] [data-tile]") as HTMLElement[];
    const tl = gsap.timeline({ scrollTrigger: { trigger: panels[1], start: "top 75%", end: "center 50%", scrub: 0.6 } });
    join.forEach((t, i) => tl.fromTo(t, { xPercent: APART[i][0] * 2.2, yPercent: APART[i][1] * 3, rotate: APART[i][2] }, { xPercent: 0, yPercent: 0, rotate: 0, ease: "power2.inOut" }, 0));
    tl.fromTo(q("[data-panel='1'] [data-join]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "power2.inOut" }, 0.4);
    // beat 03: the diary's slots fill one by one
    const dash = q("[data-panel='2'] [data-screen='dash']")[0] as HTMLElement | undefined;
    const fill = dash ? gsap.timeline({ scrollTrigger: { trigger: panels[2], start: "top 70%", once: true } })
      .fromTo(dash, { "--diary": 0 }, { "--diary": 1, duration: 1, ease: "power2.out" }, 0.2)
      .fromTo(dash, { "--toast": 0 }, { "--toast": 1, duration: 0.6, ease: "expo.out" }, 0.8)
      .fromTo(dash, { "--auto": 0 }, { "--auto": 1, duration: 1.2, ease: "none" }, 1)
      .fromTo(dash.querySelectorAll("[data-entry]"), { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.12, ease: "expo.out" }, 0) : null;
    return () => { triggers.forEach((t) => t.kill()); fill?.kill(); };
  }, { scope: root });

  return (
    <Sheet id="story" className={`section ${s.sheet}`} innerClassName={`${s.inner} page`} labelledBy="beats-title">
      <h2 id="beats-title" className="sr-only">Why BratHaus</h2>
      <div ref={root} className={s.grid}>
        <div className={s.sticky} aria-hidden="true">
          {BEATS.map((b, i) => (
            <div key={b.n} className={s.beatText} data-on={active === i ? "" : undefined}>
              <p className="mono accent">{b.n} / 03</p>
              <p className="t-h2">{b.title}</p>
              <p className="lead soft">{b.line}</p>
            </div>
          ))}
        </div>
        <ol className={s.panels}>
          {BEATS.map((b, i) => (
            <li key={b.n} className={s.panel} data-panel={i}>
              <div className={s.visual}>
                {i < 2 && (
                  <div className={`${s.tiles} ${i === 1 ? s.joined : ""}`}>
                    {i === 1 && <svg className={s.line} viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><path data-join d="M6 5 H94" pathLength={1} /></svg>}
                    {TILES.map((t) => <Tile key={t.k} {...t} />)}
                  </div>
                )}
                {i === 2 && <DeviceFrame kind="laptop" label="A salon's diary filling with bookings (illustrative)."><DashboardScreen /></DeviceFrame>}
              </div>
              {/* the words, in the flow on phones (the sticky column is hidden there) */}
              <div className={s.mobileText}>
                <p className="mono accent">{b.n} / 03</p>
                <h3 className="t-h2">{b.title}</h3>
                <p className="lead soft">{b.line}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Sheet>
  );
}
