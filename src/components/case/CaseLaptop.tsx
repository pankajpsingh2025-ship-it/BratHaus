"use client";
import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { LaptopSlot } from "@/components/three/slots";
import { useQuality } from "@/components/three/quality";
import LivePreview, { type LiveBuild } from "@/components/shared/LivePreview";
import LiveModal from "@/components/shared/LiveModal";
import Mark from "@/components/ui/Mark";
import s from "./CaseLaptop.module.css";

// The case study's laptop: held while its lid opens with scroll and the project plays on its screen;
// "Try it live" appears once it's open. With the 3D off: the live preview instead.
export default function CaseLaptop({ build, video, image }: { build: LiveBuild; video: string | null; image: string }) {
  const quality = useQuality();
  const root = useRef<HTMLElement>(null), pill = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState<LiveBuild | null>(null);
  const lite = quality === "lite";
  useGSAP(() => {
    if (!root.current || !pill.current || quality === "off") return;
    if (lite) { gsap.set(pill.current, { autoAlpha: 1 }); return; }
    gsap.fromTo(pill.current, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "45% bottom", end: "65% bottom", scrub: true } });
  }, { scope: root, dependencies: [quality] });
  if (quality === "off") return build.demo ? <section className={`${s.off} page`} aria-label="The build, live"><LivePreview build={build} /></section> : null;
  return (
    <section ref={root} className={`claptop ${s.laptop} ${lite ? s.lite : ""}`} aria-label="The build, on a laptop">
      <div className={s.stage}>
        <LaptopSlot className={s.slot} video={video} image={image} sectionSel=".claptop"
          label={`The ${build.name} site on a laptop.`} fallback={<div className="ph" aria-hidden="true"><Mark height={56} /></div>} />
        {build.demo && (
          <div ref={pill} className={s.pill}>
            <button type="button" className="btn" data-cursor="TRY IT LIVE" onClick={() => setLive(build)}>Try it live <span className="arr" aria-hidden="true">→</span></button>
          </div>
        )}
      </div>
      <LiveModal build={live} onClose={() => setLive(null)} />
    </section>
  );
}
