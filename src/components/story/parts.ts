"use client";
import { MathUtils, Object3D, Vector3 } from "three";
import type { Xf } from "@/lib/rig";

// The story's live objects, so the thread, the callouts and the nodes can find them each frame.
export const parts = {
  phone: null as Object3D | null,
  browser: null as Object3D | null,
  layers: [] as (Object3D | null)[],
  ticket: null as Object3D | null,
  laptop: null as Object3D | null,
  /** an object at the centre of the laptop/tablet screen, in the screen's plane */
  screen: null as Object3D | null,
  /** DOM roots of the screens, for their CSS variables */
  phoneUi: null as HTMLElement | null,
  /** how far the feed scrolls to stop on the ad (design px), measured from the DOM */
  feedShift: 0,
  dashUi: null as HTMLElement | null,
  layerUi: [] as (HTMLElement | null)[],
};

// Device geometry (world units at scale 1). `box` is what fitToZone() fits into the device zone:
// for the browser and the laptop that's the SCREEN's width, so the screen itself is the zone's width
// (the thin bezel may overhang the zone by a few pixels, never into the text zone). `cy` is how far
// the box's centre sits above the device's origin. css* is each screen's design size (its UI is
// laid out at that size, then zoomed to the real projected size, so 1 CSS px ≈ 1 device px).
export const PHONE = { w: 0.76, h: 1.56, d: 0.08, r: 0.11, screenW: 0.702, screenH: 1.52, screenZ: 0.0405, screenR: 0.085, cssW: 390, cssH: 844, box: { w: 0.78, h: 1.58, cy: 0 } };
export const BROWSER = { w: 2.6, h: 1.62, d: 0.03, bar: 0.08, screenW: 2.43, screenR: 0.02, cssW: 1280, cssH: 800, box: { w: 2.43, h: 1.62, cy: 0 } };
export const LAPTOP = { w: 2.84, d: 1.9, base: 0.08, lid: 0.04, lidH: 1.84, screenW: 2.72, screenR: 0.02, cssW: 1280, cssH: 800, box: { w: 2.72, h: 2.12, cy: 0.86 } };
export const TABLET = { w: 2.5, h: 1.66, d: 0.07, screenW: 2.34, screenR: 0.03, cssW: 1280, cssH: 800, box: { w: 2.34, h: 1.66, cy: 0 } };
export const TICKET = { w: 1.0, cssW: 300, cssH: 168, box: { w: 1.0, h: 0.56, cy: 0 } };
export const screenH = (s: { screenW: number; cssW: number; cssH: number }) => (s.screenW * s.cssH) / s.cssW;

export function screenPoint(px: number, py: number, s: { screenW: number; cssW: number; cssH: number }, z: number, out: Vector3) {
  const k = s.screenW / s.cssW;
  return out.set((px - s.cssW / 2) * k, (s.cssH / 2 - py) * k, z);
}

// Frame-rate independent damping (λ 6, as the brief asks) for a transform from the rig.
const D2R = Math.PI / 180;
export function dampXf(o: Object3D, x: Xf, dt: number, lambda = 6, extra?: { y?: number; ry?: number; rx?: number; s?: number }) {
  const d = Math.min(dt, 0.1);
  o.position.x = MathUtils.damp(o.position.x, x.x, lambda, d);
  o.position.y = MathUtils.damp(o.position.y, x.y + (extra?.y ?? 0), lambda, d);
  o.position.z = MathUtils.damp(o.position.z, x.z, lambda, d);
  o.rotation.x = MathUtils.damp(o.rotation.x, (x.rx + (extra?.rx ?? 0)) * D2R, lambda, d);
  o.rotation.y = MathUtils.damp(o.rotation.y, (x.ry + (extra?.ry ?? 0)) * D2R, lambda, d);
  o.rotation.z = MathUtils.damp(o.rotation.z, x.rz * D2R, lambda, d);
  const s = MathUtils.damp(o.scale.x, Math.max(0.0001, x.s * (extra?.s ?? 1)), lambda, d);
  o.scale.setScalar(s);
  o.visible = s > 0.002 && x.o > 0.002;
}
export const damp = (a: number, b: number, dt: number, lambda = 6) => MathUtils.damp(a, b, lambda, Math.min(dt, 0.1));

// Write CSS variables onto a screen's DOM root, only when a value changed.
const last = new WeakMap<HTMLElement, Record<string, string>>();
export function setVars(el: HTMLElement | null, vars: Record<string, number>) {
  if (!el) return;
  let prev = last.get(el);
  if (!prev) { prev = {}; last.set(el, prev); }
  for (const k in vars) {
    const v = vars[k].toFixed(3);
    if (prev[k] !== v) { el.style.setProperty(k, v); prev[k] = v; }
  }
}
