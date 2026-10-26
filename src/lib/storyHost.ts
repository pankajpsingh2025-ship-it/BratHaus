"use client";
import { useSyncExternalStore } from "react";
import type { ExampleMedia } from "@/content/example-business";
import type { Zones } from "@/components/story/zones";

// The home story lives in the persistent canvas's main scene: mounted once, when the home page first
// asks for it, hidden when you leave, shown again instantly when you come back. `zones` are the
// story's device and text rectangles for the current window (the timeline is built from them).
type Host = { mounted: boolean; visible: boolean; zones: Zones | null; media: ExampleMedia };
let host: Host = { mounted: false, visible: false, zones: null, media: { ad: false, adVideo: false, hero: false, cut: false, colour: false } };
const subs = new Set<() => void>();
export function setStoryHost(patch: Partial<Host>) { host = { ...host, ...patch }; subs.forEach((f) => f()); }
export const getStoryHost = () => host;
export function useStoryHost() {
  return useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => host, () => host);
}

// The DOM layer (inside the fixed canvas wrapper, under the canvas) that drei <Html> screens portal into.
export const htmlLayer: { current: HTMLDivElement | null } = { current: null };
