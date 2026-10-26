"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { initQuality, useQuality } from "./quality";
import { htmlLayer } from "@/lib/storyHost";
import styles from "./Stage.module.css";

const StageCanvas = dynamic(() => import("./StageCanvas"), { ssr: false });

// One WebGL canvas for the whole site, fixed between the page background (z 0) and the content
// (z 2). The home story draws in its main scene; smaller 3D moments are drei <View>s tracked to DOM
// boxes. The 3D code loads after the page has painted, so it's never the LCP.
export default function Stage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const quality = useQuality();
  const [go, setGo] = useState(false);
  useEffect(() => {
    const q = initQuality();
    if (q === "off") return;
    const events = ["pointermove", "pointerdown", "wheel", "touchstart", "keydown", "scroll"] as const;
    let timer = 0;
    const start = () => { clearTimeout(timer); events.forEach((e) => removeEventListener(e, start)); requestAnimationFrame(() => setGo(true)); };
    // The home story (and the first-visit preloader that waits for it) starts right after first
    // paint. Elsewhere the 3D waits for the visitor's first interaction or 2.5s.
    const eager = document.documentElement.classList.contains("is-preloading") || Boolean(document.querySelector("[data-story]"));
    const arm = () => {
      if (eager) { timer = window.setTimeout(start, 60); return; }
      events.forEach((e) => addEventListener(e, start, { passive: true, once: true }));
      timer = window.setTimeout(start, 2500);
    };
    if (document.readyState === "complete") arm();
    else addEventListener("load", arm, { once: true });
    return () => { clearTimeout(timer); events.forEach((e) => removeEventListener(e, start)); };
  }, []);
  return (
    <div ref={ref} className={styles.stage}>
      <div className={styles.gl} aria-hidden="true">
        {/* drei <Html> screens sit here, under the canvas, which cuts holes for them */}
        <div className={styles.html} ref={(el) => { htmlLayer.current = el; }} />
        {go && quality !== "off" && quality !== "pending" && <StageCanvas eventSource={ref} quality={quality} />}
      </div>
      {children}
    </div>
  );
}
