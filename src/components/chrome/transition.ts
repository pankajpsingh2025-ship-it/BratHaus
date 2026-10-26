"use client";
// Programmatic page changes through the curtain (3D frame clicks, the footer's next-page zone).
type Go = (href: string) => void;
let handler: Go | null = null;
export const setTransitionHandler = (fn: Go | null) => { handler = fn; };
export function go(href: string) {
  if (handler) handler(href);
  else location.assign(href);
}
