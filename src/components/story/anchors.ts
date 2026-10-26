"use client";
import { Vector3 } from "three";
import { rig } from "@/lib/rig";
import { BROWSER, LAPTOP, parts, PHONE, screenPoint, TABLET } from "./parts";

// Where things are, in world space, recomputed every frame from the live objects.
// The gold thread (S5) runs between device EDGES, never across a screen:
//   0 off-screen right → 1 the phone's edge beside the ad's "Book now" → 2 the browser panel's left
//   edge → 3 the phone's bottom edge → 4 the booking ticket's edge → 5 the laptop screen's left edge.
// In the finale every anchor slides to its node, and the four nodes form the constellation.
export const ANCHORS = 6;

// A DOM element's box inside a screen's UI root, in that screen's DESIGN px (layout offsets, so the
// values don't depend on the 3D transform; normalised by the root's own width in case zoom applies).
const cache = new Map<string, { x: number; y: number; w: number; h: number }>();
export function domBox(root: HTMLElement | null, sel: string, designW: number, keep = true) {
  if (!root) return null;
  const key = `${designW}:${sel}`;
  const hit = keep ? cache.get(key) : undefined;
  if (hit) return hit;
  const el = root.querySelector<HTMLElement>(sel);
  if (!el || !el.offsetWidth || !root.offsetWidth) return null;
  let x = 0, y = 0, n: HTMLElement | null = el;
  while (n && n !== root) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent as HTMLElement | null; }
  const k = designW / root.offsetWidth;
  const b = { x: (x + el.offsetWidth / 2) * k, y: (y + el.offsetHeight / 2) * k, w: el.offsetWidth * k, h: el.offsetHeight * k };
  if (keep) cache.set(key, b);
  return b;
}
export const clearAnchorCache = () => cache.clear();

/** The ad's "Book now" button on the phone screen (where the feed has scrolled it to). */
export function adButtonLocal(out: Vector3) {
  const p = domBox(parts.phoneUi, "[data-anchor='ad-cta']", PHONE.cssW) ?? { x: 195, y: 1300, w: 358, h: 46 };
  return screenPoint(p.x, p.y - parts.feedShift * rig.ui.feed, PHONE, 0, out);
}

/** The new booking's slot in the dashboard diary (design px of the laptop/tablet screen). */
export function diarySlot(tall: boolean) {
  return domBox(parts.dashUi, "[data-slot='new']", (tall ? TABLET : LAPTOP).cssW) ?? { x: 1000, y: 286, w: 104, h: 80 };
}

// a point in an object's local space, in world space (and a little behind its face)
const at = (o: { localToWorld: (v: Vector3) => Vector3 } | null | undefined, out: Vector3, x: number, y: number, z: number) => (o ? o.localToWorld(out.set(x, y, z)) : out);

export function threadAnchors(out: Vector3[], tall: boolean, nodes: Vector3[]) {
  const ph = parts.phone;
  // 1: the phone's right edge, level with "Book now"
  adButtonLocal(out[1]);
  at(ph, out[1], PHONE.w / 2 + 0.012, out[1].y, -0.02);
  // 0: from off-screen right, at the same height (the device zone is on the right; the text never is)
  out[0].copy(out[1]).add(t.set(tall ? 2.4 : 4.2, 0.25, -0.3));
  // 2: the browser panel's left edge
  at(parts.browser, out[2], -BROWSER.w / 2 - 0.012, 0, -0.02);
  // 3: the phone's bottom edge
  at(ph, out[3], 0, -PHONE.h / 2 - 0.012, -0.02);
  // 4: the ticket's left edge (top edge on portrait, where it sits above the phone)
  if (tall) at(parts.ticket, out[4], 0, 0.3, -0.02); else at(parts.ticket, out[4], -0.52, 0, -0.02);
  // 5: the laptop screen's left edge (the tablet's top edge on portrait)
  const S = tall ? TABLET : LAPTOP;
  const sh = (S.screenW * S.cssH) / S.cssW;
  if (tall) at(parts.screen, out[5], 0, sh / 2 + 0.06, -0.01); else at(parts.screen, out[5], -S.screenW / 2 - 0.03, 0, -0.01);
  // the finale: every anchor slides to its node
  const p = smooth(rig.nodes.p);
  if (p > 0) {
    const map = [0, 0, 1, 2, 3, 3];
    for (let i = 0; i < ANCHORS; i++) out[i].lerp(nodes[map[i]], p);
  }
  return out;
}
const t = new Vector3();
const smooth = (x: number) => x * x * (3 - 2 * x);
