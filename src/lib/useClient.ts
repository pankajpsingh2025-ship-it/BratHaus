"use client";
import { useSyncExternalStore } from "react";

// Hydration-safe browser values: the server (and the hydrating render) see the fallback,
// then React re-renders with the real value. No setState-in-effect needed.
const noop = () => () => {};
export function useMounted() {
  return useSyncExternalStore(noop, () => true, () => false);
}
export function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => { const m = matchMedia(query); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); },
    () => matchMedia(query).matches,
    () => false,
  );
}
