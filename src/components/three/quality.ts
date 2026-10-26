"use client";
import { useSyncExternalStore } from "react";

// How much 3D this visitor gets:
//   off  – reduced motion, no WebGL2, Save-Data, or ?3d=off  → still images
//   lite – touch, ≤4 cores or < 900px wide                    → dpr 1, light bloom only, half the particles
//   high – everything else
// "pending" until we've checked in the browser. Decided ONCE, at startup, and never changed after:
// a slow frame can only lower the canvas's effects (useEffectsLevel), never swap or unmount the DOM.
export type Quality = "pending" | "off" | "lite" | "high";

let level: Quality = "pending";
// ?3d=force / ?3d=force-lite: fixed quality, never stepped down (testing and capturing the stills).
export let forced = false;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

function detect(): Quality {
  try {
    const q = new URLSearchParams(location.search).get("3d");
    if (q === "off") return "off";
    if (q === "force") { forced = true; return "high"; }
    if (q === "force-lite") { forced = true; return "lite"; }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return "off";
    if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return "off";
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return "off";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    if (q === "lite") return "lite";
    const touch = matchMedia("(pointer: coarse)").matches;
    if (touch || (navigator.hardwareConcurrency || 8) <= 4 || innerWidth < 900) return "lite";
    return "high";
  } catch {
    return "off";
  }
}

export function initQuality() {
  if (level !== "pending") return level;
  level = detect();
  (window as unknown as { __quality?: Quality }).__quality = level;
  emit();
  return level;
}
export function useQuality(): Quality {
  return useSyncExternalStore(
    (cb) => { subs.add(cb); return () => subs.delete(cb); },
    () => level,
    () => "pending",
  );
}

// Paused while the page-transition curtain covers the screen: no WebGL work under it.
let paused = false;
const psubs = new Set<() => void>();
export function setPaused(v: boolean) { paused = v; psubs.forEach((f) => f()); }
export function usePaused() {
  return useSyncExternalStore((cb) => { psubs.add(cb); return () => psubs.delete(cb); }, () => paused, () => false);
}

// Moments mount one at a time (~180ms apart) so starting the 3D never blocks the page in one go.
const turns: (() => void)[] = [];
let busy = false;
function pump() {
  if (busy || !turns.length) return;
  busy = true;
  turns.shift()!();
  setTimeout(() => { busy = false; pump(); }, 180);
}
export function queueTurn(cb: () => void) {
  turns.push(cb);
  pump();
  return () => { const i = turns.indexOf(cb); if (i >= 0) turns.splice(i, 1); };
}

// The canvas's effects, the only thing PerformanceMonitor may change at runtime: "reduced" drops the
// dpr to 1, the noise/vignette and half the particles; "full" restores them.
export type Effects = "full" | "reduced";
let effects: Effects = "full";
const esubs = new Set<() => void>();
export function setEffects(e: Effects) { if (forced || e === effects) return; effects = e; esubs.forEach((f) => f()); }
export function useEffectsLevel() {
  return useSyncExternalStore((cb) => { esubs.add(cb); return () => esubs.delete(cb); }, () => effects, () => "full" as Effects);
}
