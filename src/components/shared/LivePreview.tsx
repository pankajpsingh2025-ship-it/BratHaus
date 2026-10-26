"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useMedia } from "@/lib/useClient";

export type LiveBuild = { name: string; demo?: string | null; video?: string | null; poster?: string | null; kind?: string; external?: boolean };
const SIZES = { desktop: [1440, 900], phone: [390, 844] } as const;

// A live, clickable preview of a real website in a browser frame (ported from the previous site).
// Poster/video first, "Try it live" loads the real site in an iframe at true size, scaled to fit.
// Desktop/Phone, Reload, New tab. Small/touch screens get "Open the live site" in a new tab.
export default function LivePreview({ build, autoLive = false, priority = false }: { build: LiveBuild; autoLive?: boolean; priority?: boolean }) {
  const [live, setLive] = useState(autoLive);
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const [reload, setReload] = useState(0);
  const [scale, setScale] = useState(0.5);

  const view = useRef<HTMLDivElement>(null);
  const [vw, vh] = SIZES[device];
  const small = useMedia("(max-width: 720px), (pointer: coarse)");
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const motion = !small && !reduced;
  useEffect(() => {
    const el = view.current; if (!el) return;
    const fit = () => setScale(device === "desktop" ? el.clientWidth / vw : el.clientHeight / vh);
    fit();
    const ro = new ResizeObserver(fit); ro.observe(el);
    return () => ro.disconnect();
  }, [device, vw, vh, live]);
  if (!build.demo) return null;
  const href = build.demo;
  return (
    <div className={`live live--${device} ${live ? "is-live" : ""}`}>
      <div className="live__bar">
        <span className="live__dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="live__url">{href.replace(/^https?:\/\//, "")}</span>
        <div className="live__tools">
          {!small && (
            <div className="live__switch" role="group" aria-label="Preview size">
              <button type="button" aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")}>Desktop</button>
              <button type="button" aria-pressed={device === "phone"} onClick={() => setDevice("phone")}>Phone</button>
            </div>
          )}
          {live && !small && <button type="button" className="live__tool" onClick={() => setReload((n) => n + 1)}>Reload</button>}
          <a className="live__tool" href={href} target="_blank" rel="noopener">New tab <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div className="live__view" ref={view}>
        {live && !small ? (
          <div className="live__screen" style={{ width: vw * scale, height: vh * scale }}>
            <iframe key={`${device}-${reload}`} src={href} title={`Live preview of the ${build.name} website`} allow="autoplay; fullscreen" style={{ width: vw, height: vh, transform: `scale(${scale})` }} />
          </div>
        ) : (
          <>
            {/* An optimised poster first; the looping preview video plays over it on larger screens only. */}
            {build.poster ? <Image className="live__poster" src={build.poster} alt="" fill priority={priority} sizes="(max-width: 1440px) 100vw, 1320px" />
              : <div className="ph live__poster" aria-hidden="true"><span>{build.name}</span></div>}
            {build.video && motion && <video className="live__poster" src={build.video} muted loop playsInline autoPlay preload="none" aria-hidden="true" />}
            <div className="live__cta">
              {small
                ? <a className="btn" href={href} target="_blank" rel="noopener">Open the live site <span className="arr" aria-hidden="true">↗</span></a>
                : <button type="button" className="btn" data-cursor="TRY IT LIVE" onClick={() => setLive(true)}>Try it live <span className="arr" aria-hidden="true">→</span></button>}
              <p>The real {build.name} site{small ? ", in a new tab" : ", running right here"}. {build.kind === "Concept build" ? "A concept build for a fictional brand." : ""}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
