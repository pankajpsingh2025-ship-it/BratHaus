"use client";
import type Lenis from "lenis";
import { useSyncExternalStore } from "react";

// The live Lenis instance, as a tiny external store (null under reduced motion).
let current: Lenis | null = null;
const subs = new Set<() => void>();
export const setLenis = (l: Lenis | null) => { current = l; subs.forEach((f) => f()); };
export const getLenis = () => current;
export const useLenis = () => useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => current, () => null);

// Scroll to an element or a y offset, smoothly when Lenis is running.
export function scrollToTarget(target: string | number | HTMLElement, opts: { offset?: number; immediate?: boolean } = {}) {
  const l = current;
  if (l) { l.scrollTo(target, { offset: opts.offset ?? 0, immediate: opts.immediate, duration: opts.immediate ? 0 : 1.4 }); return; }
  const y = typeof target === "number" ? target
    : (typeof target === "string" ? document.querySelector<HTMLElement>(target) : target)?.getBoundingClientRect().top ?? 0;
  window.scrollTo({ top: typeof target === "number" ? y : y + scrollY + (opts.offset ?? 0), behavior: opts.immediate ? "auto" : "smooth" });
}
