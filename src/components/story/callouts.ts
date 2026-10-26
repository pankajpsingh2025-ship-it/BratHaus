"use client";
import { Vector3 } from "three";
import { rig } from "@/lib/rig";
import { BROWSER, LAPTOP, parts, screenH, TICKET } from "./parts";

// The story's 3D annotations: a gold dot on a device EDGE, a short vertical leader and a mono label
// in square brackets, projected into the DOM each frame. At most 2 per chapter, landscape only (none
// on portrait). They sit in the device zone above or below the device, so they never meet the text.
export type Callout = {
  id: string; label: string; from: number; to: number;
  /** the leader goes up (label above the edge) or down (below it) */
  dir: "up" | "down";
  anchor: (out: Vector3) => Vector3 | null;
};

const at = (o: { localToWorld: (v: Vector3) => Vector3 } | null | undefined, out: Vector3, x: number, y: number, z = 0) => (o ? o.localToWorld(out.set(x, y, z)) : null);
// the panel's top edge in a layer's space (the layers sit on the screen's centre, under the top bar)
const top = screenH(BROWSER) / 2 + BROWSER.bar + 0.005;
// the lid's top edge in the screen's space (the screen sits 0.03 above the lid's middle)
const lidTop = LAPTOP.lidH / 2 - 0.03;
const ticketH = (TICKET.w * TICKET.cssH) / TICKET.cssW;

export const CALLOUTS: Callout[] = [
  // 02 · websites: on the separated layers' top edges
  { id: "co-design", label: "[ A ] Bespoke design", from: 0.365, to: 0.428, dir: "up", anchor: (o) => at(parts.layers[0], o, -0.78, top) },
  { id: "co-message", label: "[ B ] Clear message", from: 0.372, to: 0.428, dir: "up", anchor: (o) => at(parts.layers[1], o, 0.42, top) },
  // 03 · AI agents: under the ticket
  { id: "co-books", label: "[ A ] Books & confirms", from: 0.635, to: 0.655, dir: "down", anchor: (o) => (rig.ticket.lift > 0.95 ? at(parts.ticket, o, 0, -ticketH / 2 - 0.01) : null) },
  // 04 · software: on the lid's top edge
  { id: "co-diary", label: "[ A ] Diary & bookings", from: 0.79, to: 0.835, dir: "up", anchor: (o) => at(parts.screen, o, -0.9, lidTop) },
  { id: "co-remind", label: "[ B ] Automatic reminders", from: 0.805, to: 0.835, dir: "up", anchor: (o) => at(parts.screen, o, 0.75, lidTop) },
];

export const calloutOn = (c: Callout) => rig.progress >= c.from && rig.progress <= c.to;
