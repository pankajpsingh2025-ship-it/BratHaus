"use client";
// The story's two places on screen, in CSS pixels: the DEVICE zone (where 3D devices may appear) and
// the TEXT zone (where chapter words may appear). Computed from the window on every resize, never
// from media queries, so the story can't fall back to a wrong framing. Every device keyframe is an
// anchor inside the device zone ({ ax, ay, fill }), turned into world units by fitToZone().
export type Rect = { x: number; y: number; w: number; h: number };
export type Layout = "landscape" | "portrait" | "short";
export type Zones = {
  layout: Layout; vw: number; vh: number; header: number; margin: number; device: Rect; text: Rect;
  /** the canvas's own size, if it differs from the stage's (mobile toolbars): used for projection only */
  cw?: number; ch?: number;
};

export function computeZones(vw: number, vh: number, safeBottom = 0, allowShort = true): Zones {
  const margin = Math.min(112, Math.max(20, vw * 0.06));
  const header = vw <= 640 ? 56 : 64;
  if (vh < 520 && allowShort) {
    return { layout: "short", vw, vh, header, margin, device: { x: 0, y: 0, w: 0, h: 0 }, text: { x: margin, y: header, w: vw - margin * 2, h: vh - header } };
  }
  if (vw >= 1024 && vw / vh >= 1.2) {
    const top = header + 24;
    const tx = margin, tw = Math.min(560, vw * 0.42 - margin);
    return {
      layout: "landscape", vw, vh, header, margin,
      device: { x: vw * 0.46, y: top, w: vw * 0.5, h: vh * 0.92 - top },
      // the words sit bottom-aligned 10% above the bottom edge
      text: { x: tx, y: top, w: tw, h: vh * 0.9 - top },
    };
  }
  const top = header + 12;
  const tTop = vh * 0.58, tBottom = vh * 0.96 - safeBottom;
  return {
    layout: "portrait", vw, vh, header, margin,
    device: { x: margin, y: top, w: vw - margin * 2, h: vh * 0.56 - top },
    text: { x: margin, y: tTop, w: vw - margin * 2, h: tBottom - tTop },
  };
}

// The camera never moves: devices are placed and sized against it.
export const CAMERA = { z: 8, fov: 30 };

/** A device keyframe, relative to the device zone. */
export type Anchor = { ax: number; ay: number; fill: number; rx?: number; ry?: number; rz?: number; z?: number; o?: number };
/** The device's nominal size at scale 1 (world units), for fitting; cy = the box centre above the origin. */
export type Box = { w: number; h: number; cy?: number };
export type Pose = { x: number; y: number; z: number; s: number; rx: number; ry: number; rz: number; o: number; pxPerUnit: number; cx: number; cy: number; pw: number; ph: number };

const unitsPerPx = (z: number, zones: Zones) => (2 * Math.tan((CAMERA.fov * Math.PI) / 360) * (CAMERA.z - z)) / (zones.ch ?? zones.vh);
const half = (zones: Zones) => ({ x: (zones.cw ?? zones.vw) / 2, y: (zones.ch ?? zones.vh) / 2 });

/** World position and scale that puts a device of size `box` at `a` inside the device zone. The
 *  centre is clamped so the whole box stays inside the zone (the brief's anchors near the edges). */
export function fitToZone(a: Anchor, box: Box, zones: Zones): Pose {
  const z = a.z ?? 0;
  const k = unitsPerPx(z, zones);                     // world units per CSS pixel at that depth
  const d = zones.device;
  const s = a.fill * Math.min((d.w * k) / box.w, (d.h * k) / box.h);
  const pw = (box.w * s) / k, ph = (box.h * s) / k;   // the box on screen, in CSS px
  const cx = clamp(d.x + a.ax * d.w, d.x + pw / 2, d.x + d.w - pw / 2);
  const cy = clamp(d.y + a.ay * d.h, d.y + ph / 2, d.y + d.h - ph / 2);
  const c = half(zones);
  return {
    x: (cx - c.x) * k,
    y: -(cy - c.y) * k - (box.cy ?? 0) * s,
    z, s,
    rx: a.rx ?? 0, ry: a.ry ?? 0, rz: a.rz ?? 0, o: a.o ?? 1,
    /** CSS pixels per world unit at this depth (for sizing screens 1:1) */
    pxPerUnit: 1 / k, cx, cy, pw, ph,
  };
}
const clamp = (v: number, lo: number, hi: number) => (lo > hi ? (lo + hi) / 2 : Math.min(hi, Math.max(lo, v)));

/** A point inside the device zone, in world units at depth z (for nodes and the logo). */
export function zonePoint(ax: number, ay: number, z: number, zones: Zones) {
  const k = unitsPerPx(z, zones);
  const d = zones.device, c = half(zones);
  return { x: (d.x + ax * d.w - c.x) * k, y: -(d.y + ay * d.h - c.y) * k, z, k };
}

/** World units → CSS px at depth z. */
export const pxAt = (z: number, zones: Zones) => 1 / unitsPerPx(z, zones);

/** A point given in CSS px (stage coordinates), in world units at depth z. */
export function zonePointPx(px: number, py: number, z: number, zones: Zones) {
  const k = unitsPerPx(z, zones), c = half(zones);
  return { x: (px - c.x) * k, y: -(py - c.y) * k, z, k };
}
