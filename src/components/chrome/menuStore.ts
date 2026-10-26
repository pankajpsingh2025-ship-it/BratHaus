"use client";
import { useSyncExternalStore } from "react";

// The full-screen menu: the site's pages (and, on the home page, the story's chapters).
type MenuState = { open: boolean; chapters: boolean };
let state: MenuState = { open: false, chapters: false };
const subs = new Set<() => void>();
const set = (p: Partial<MenuState>) => { state = { ...state, ...p }; subs.forEach((f) => f()); };
export const openMenu = (opts: { chapters?: boolean } = {}) => set({ open: true, chapters: Boolean(opts.chapters) });
export const closeMenu = () => set({ open: false });
export const useMenu = () => useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => state, () => state);

// The scroll position of a point in the home story (progress 0–1): the story is scrubbed from its
// top reaching the top of the screen to its bottom reaching the bottom (one sticky 100svh stage).
export function storyScrollY(p: number) {
  const el = document.querySelector<HTMLElement>("[data-story]");
  const front = el?.querySelector<HTMLElement>("[data-front]");
  if (!el) return null;
  const len = el.offsetHeight - (front?.offsetHeight ?? innerHeight);
  return el.getBoundingClientRect().top + scrollY + len * p;
}
