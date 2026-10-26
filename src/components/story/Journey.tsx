"use client";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { rig, story } from "@/lib/rig";
import { setStoryHost } from "@/lib/storyHost";
import { scrollToTarget } from "@/lib/lenis";
import { services } from "@/content/services";
import { example, type ExampleMedia } from "@/content/example-business";
import { useQuality } from "@/components/three/quality";
import { openMenu, storyScrollY } from "@/components/chrome/menuStore";
import ChapterRing from "./ChapterRing";
import StoryFlat from "./StoryFlat";
import { CALLOUTS } from "./callouts";
import { buildStory, chapterAt, placeOverlays, planFor, type Overlays } from "./timeline";
import { computeZones, type Zones } from "./zones";
import s from "./Journey.module.css";

export const STORY_CHAPTERS = [
  ...services.map((x) => ({ n: String(x.order).padStart(2, "0"), label: x.title })),
  { n: "05", label: "One studio" },
];

const H1 = ["Websites that win.", "Automations that work."];
const LABEL = "BratHaus · UK studio";
const LEAD = "BratHaus is a UK studio. We run your ads, build your website, and set up AI agents and software that answer, book and organise every customer.";
const NODE_LABELS = ["Ad", "Website", "AI agent", "Dashboard"];

// The home story: 640svh (520svh portrait) of scroll with a sticky 100svh stage. One ScrollTrigger
// (top top → bottom bottom, scrub 1) drives one master timeline and writes the progress on every
// update (wheel, keys, touch or code). Two sticky layers share the stage:
//   .back  (z 0, under the fixed canvas): the hero logo's glow and the portrait text gradient
//   .front (z 2, over it): the hero, the text zone (one chapter at a time), the labels, ring, skip, cue
// The hero: the words on the left (on top on phones), the 3D mark on the right (in the canvas).
// Devices and words each live in their own zone (zones.ts), recomputed on every resize.
// Quality is decided once at startup: this section never unmounts afterwards (data-story-id). Only
// when the 3D is off from the start (or the screen is under 520px tall at load) is it the flat story.
export default function Journey({ media, bookingUrl }: { media: ExampleMedia; bookingUrl: string }) {
  const root = useRef<HTMLElement>(null);
  const storyId = useId();
  const quality = useQuality();
  // decided once, from the first measurement: never swapped afterwards
  const [shortAtStart, setShortAtStart] = useState<boolean | null>(null);
  const [zones, setZones] = useState<Zones | null>(null);
  const [chapter, setChapter] = useState({ index: 0, within: 0 });
  const off = quality === "off";
  const book = bookingUrl || "/contact";
  const ext = bookingUrl ? { target: "_blank", rel: "noopener" } : {};

  // the zones: from the window (the stage's real height, so svh is honoured, and the safe area)
  useEffect(() => {
    let last = "";
    const first = { current: true };
    let timer = 0;
    const probe = document.createElement("div");
    probe.style.cssText = "position:fixed;left:0;bottom:0;width:0;height:env(safe-area-inset-bottom,0px);visibility:hidden;pointer-events:none";
    document.body.appendChild(probe);
    const measure = () => {
      const front = root.current?.querySelector<HTMLElement>("[data-front]");
      const vw = document.documentElement.clientWidth;
      const vh = front?.offsetHeight || innerHeight;
      const key = `${vw}x${vh}`;
      if (key === last) return;
      last = key;
      // "short" (under 520px tall) is only ever decided at the first measurement: after that a short
      // window just gets the normal framing, never a swap
      const z = computeZones(vw, vh, probe.offsetHeight, first.current);
      z.cw = vw; z.ch = innerHeight;
      if (first.current) { first.current = false; setShortAtStart(z.layout === "short"); }
      setZones(z);
    };
    const later = () => { clearTimeout(timer); timer = window.setTimeout(measure, 120); };
    measure();
    addEventListener("resize", later);
    addEventListener("orientationchange", later);
    return () => { removeEventListener("resize", later); removeEventListener("orientationchange", later); clearTimeout(timer); probe.remove(); };
  }, []);
  const layout = zones?.layout;
  const short = shortAtStart === true;
  useEffect(() => { if (zones) setStoryHost({ zones, media }); }, [zones, media]);

  // ask the canvas for the story (it stays mounted afterwards) and hide it when we leave
  useEffect(() => {
    if (off || short || quality === "pending" || !zones) return;
    story.lite = quality === "lite";
    setStoryHost({ mounted: true });
    return () => setStoryHost({ visible: false });
  }, [off, short, quality, zones]);

  // the hero's words rise in once the page is ready (after the preloader on a first visit)
  useEffect(() => {
    const el = root.current?.querySelector("[data-hero]"); if (!el || off || short) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lines = el.querySelectorAll("[data-line] > span");
    const rest = el.querySelectorAll("[data-rise]");
    gsap.set(lines, { yPercent: 105 }); gsap.set(rest, { autoAlpha: 0, y: 16 });
    const go = () => {
      gsap.to(lines, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, delay: 0.05 });
      gsap.to(rest, { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, delay: 0.35 });
    };
    if (document.documentElement.classList.contains("is-preloading")) addEventListener("bh:preloader-done", go, { once: true }); else go();
    return () => { removeEventListener("bh:preloader-done", go); gsap.set([...lines, ...rest], { clearProps: "all" }); };
  }, [off, short]);

  useGSAP(() => {
    const el = root.current; if (!el || off || short || quality === "pending" || !zones) return;
    const q = gsap.utils.selector(el);
    const one = (sel: string) => (q(sel)[0] as HTMLElement | undefined) ?? null;
    const ov: Overlays = {
      hero: one("[data-hero]"), glow: one("[data-glow]"),
      chapters: q("[data-chapter]") as HTMLElement[], finale: one("[data-finale]"),
      example: one("[data-example]"), convo: one("[data-convo]"),
      chips: q("[data-chip]") as HTMLElement[], chipsLabel: one("[data-chips-label]"),
      nodeLabels: q("[data-node]") as HTMLElement[], scrollHint: one("[data-scroll]"),
    };
    const plan = planFor(zones);
    placeOverlays(plan, ov);
    const tl = buildStory(plan, ov);
    // progress is written on EVERY scroll update (the scrubbed timeline lags behind it by design)
    const st = ScrollTrigger.create({
      trigger: el, start: "top top", end: "bottom bottom", scrub: 1, animation: tl, invalidateOnRefresh: true,
      onUpdate: (self) => {
        rig.progress = self.progress;
        const c = chapterAt(self.progress);
        setChapter((p) => (p.index === c.index && Math.abs(p.within - c.within) < 0.02 ? p : c));
      },
    });
    // the 3D only draws while the story is on screen
    const vis = ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onToggle: (self) => setStoryHost({ visible: self.isActive }) });
    setStoryHost({ visible: vis.isActive || ScrollTrigger.isInViewport(el) });
    // the scroll cue's line fills with the hero's progress
    const hint = q("[data-scroll] i")[0];
    const fill = hint ? gsap.fromTo(hint, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: () => `+=${(el.offsetHeight - innerHeight) * 0.08}`, scrub: true } }) : null;
    ScrollTrigger.refresh();
    return () => { st.kill(); vis.kill(); tl.kill(); fill?.scrollTrigger?.kill(); fill?.kill(); };
  }, { scope: root, dependencies: [zones, off, short, quality] });

  // the phone rises in once the 3D is ready (after the preloader on a first visit)
  useEffect(() => {
    if (off || short) return;
    const go = () => gsap.to(story, { intro: 1, duration: 1.2, ease: "expo.out", delay: 0.1 });
    if (story.intro > 0) return;
    const wait = () => (document.documentElement.classList.contains("is-preloading") ? addEventListener("bh:preloader-done", go, { once: true }) : go());
    addEventListener("bh:story-ready", wait, { once: true });
    return () => { removeEventListener("bh:story-ready", wait); removeEventListener("bh:preloader-done", go); };
  }, [off, short]);

  const skip = () => scrollToTarget("#statement", { offset: 0 });
  const watch = () => { const y = storyScrollY(0.15); if (y !== null) scrollToTarget(y); };
  if (off || short) return <StoryFlat media={media} bookingUrl={book} h1={H1} lead={LEAD} label={LABEL} />;

  const ring = <ChapterRing chapter={chapter} chapters={STORY_CHAPTERS} compact={layout === "portrait"} onOpen={() => openMenu({ chapters: true })} />;
  const z = zones;
  const vars = (z ? {
    "--tx": `${z.text.x}px`, "--ty": `${z.text.y}px`, "--tw": `${z.text.w}px`, "--th": `${z.text.h}px`,
    "--dx": `${z.device.x}px`, "--dy": `${z.device.y}px`, "--dw": `${z.device.w}px`, "--dh": `${z.device.h}px`,
  } : {}) as CSSProperties;

  return (
    <section ref={root} className={s.story} data-story data-story-id={storyId} data-zoned={zones ? "" : undefined} data-theme="night" data-layout={layout ?? "landscape"} style={vars} aria-label="How BratHaus works: one customer, four services">
      {/* z 0, under the canvas: the H1, so the phone can stand in front of its second line */}
      <div className={s.back}>
        <div className={s.glow} aria-hidden="true" />
        <div className={s.logoGlow} data-glow aria-hidden="true" />
        <div className={s.fade} aria-hidden="true" />
      </div>

      {/* z 2, over the canvas: every other word of the story */}
      <div className={`${s.front} on-night`} data-front>
        <div className={s.hero} data-hero>
          <p className="mono accent" data-rise>{LABEL}</p>
          <h1 className={`display t-display ${s.h1}`}>
            {H1.map((l) => <span key={l} className={s.line} data-line><span>{l}</span></span>)}
          </h1>
          <p className={`lead soft ${s.lead}`} data-rise>{LEAD}</p>
          <div className={s.actions} data-rise>
            <a className="btn" href={book} {...ext}>Book a 20-minute call <span className="arr" aria-hidden="true">→</span></a>
            <button type="button" className="tlink" onClick={watch}>Watch a customer arrive <span className="arr" aria-hidden="true">↓</span></button>
          </div>
        </div>
        <div className={s.textZone} data-text-zone>

          {services.map((x) => (
            <article key={x.id} className={s.chapter} data-chapter aria-labelledby={`ch-${x.id}`}>
              <p className="mono accent">{String(x.order).padStart(2, "0")} · {x.title}</p>
              <h2 id={`ch-${x.id}`} className="t-h2">{x.chapterTitle}</h2>
              <p className={`lead soft ${s.line2}`}>{x.storyLine}</p>
              <Link className="tlink tlink--accent" href={`/services#${x.id}`}>{x.title} <span className="arr" aria-hidden="true">→</span></Link>
            </article>
          ))}

          <div className={`${s.chapter} ${s.finale}`} data-finale>
            <h2 className="t-h2">One studio. From first click to booked customer.</h2>
            <div className={s.actions}>
              <a className="btn" href={book} {...ext}>Book a 20-minute call <span className="arr" aria-hidden="true">→</span></a>
              <Link className="tlink" href="/work">See our work <span className="arr" aria-hidden="true">→</span></Link>
            </div>
          </div>
        </div>

        {/* labels beside the devices, all inside the device zone */}
        <div className={s.labels} aria-hidden="true">
          <p className={`${s.chipsLabel} mono mono--sm soft`} data-chips-label>{example.targetingLabel}</p>
          {example.targeting.map((t) => <span key={t} className={s.chip} data-chip><i />{t}</span>)}
          <p className={`${s.convo} mono mono--sm soft`} data-convo>{example.chat.label}</p>
          {NODE_LABELS.map((n) => <p key={n} className={`${s.node} mono`} data-node>{n}</p>)}
          {CALLOUTS.map((c) => (
            <div key={c.id} id={c.id} className={s.co}>
              <div className={`${s.coIn} ${c.dir === "down" ? s.coDown : ""}`}><i className={s.coDot} /><i className={s.coLine} /><span className="mono mono--sm">{c.label}</span></div>
            </div>
          ))}
        </div>
        <p className={`${s.example} mono mono--sm`} data-example>{example.label}</p>

        <div className={s.foot}>
          <button type="button" className={`${s.skip} mono`} onClick={skip}>[ Skip the story <span aria-hidden="true">↓</span> ]</button>
          {layout !== "portrait" && ring}
        </div>
        {layout === "portrait" && ring}
        <p className={`${s.scroll} mono`} data-scroll aria-hidden="true">[ Scroll ]<span><i /></span></p>
      </div>
    </section>
  );
}
