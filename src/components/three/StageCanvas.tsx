"use client";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor, View } from "@react-three/drei";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { useState, type RefObject } from "react";
import { forced, setEffects, usePaused, type Quality } from "./quality";
import StoryHost from "./StoryHost";

export default function StageCanvas({ eventSource, quality }: { eventSource: RefObject<HTMLDivElement | null>; quality: Quality }) {
  const paused = usePaused();
  // dpr capped at 1.75 on desktop, 1.5 on phones
  const max = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse) and (max-width: 900px)").matches ? 1.5 : 1.75;
  const [dpr, setDpr] = useState<number | [number, number]>(() => (quality === "high" ? [1, max] : [1, Math.min(1.5, max)]));
  return (
    <Canvas
      eventSource={eventSource as RefObject<HTMLElement>}
      eventPrefix="client"
      dpr={dpr}
      // The canvas is fixed to the viewport, so it never needs scroll-based re-measuring (with it on,
      // continuous smooth scrolling keeps resetting the debounce and the canvas never gets a size).
      resize={{ scroll: false, debounce: { scroll: 0, resize: 60 } }}
      frameloop={paused ? "never" : "always"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1, outputColorSpace: SRGBColorSpace }}
      camera={{ fov: 30, position: [0, 0, 6], near: 0.1, far: 100 }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      // exposed for the memory check in the verification scripts (read-only use)
      onCreated={({ gl }) => { (window as unknown as { __bhGL?: unknown }).__bhGL = gl; }}
    >
      {/* A slow patch only lowers the effects (dpr 1, no noise/vignette, half the particles), and a
          good patch restores them. Nothing here ever changes the page's DOM or layout. */}
      {!forced && (
        <PerformanceMonitor bounds={() => [45, 58]} flipflops={6}
          onDecline={() => { setDpr(1); setEffects("reduced"); }}
          onIncline={() => { setDpr(quality === "high" ? [1, max] : [1, Math.min(1.5, max)]); setEffects("full"); }} />
      )}
      {/* the home story, in the main scene; persistent once built */}
      <StoryHost />
      {/* framed scenes tracked to DOM boxes (Services, case study, 404) */}
      <View.Port />
    </Canvas>
  );
}
