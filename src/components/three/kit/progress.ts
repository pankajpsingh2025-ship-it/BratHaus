// Scroll progress of an element (no three.js import, safe for page code).
export function readProgress(el: Element | null, mode: "through" | "pin" | "exit" = "through") {
  if (!el) return 0;
  const r = el.getBoundingClientRect(), vh = innerHeight;
  let p = 0;
  if (mode === "pin") p = -r.top / Math.max(1, r.height - vh);
  else if (mode === "exit") p = -r.top / Math.max(1, r.height);
  else p = (vh - r.top) / (vh + r.height);
  return Math.min(1, Math.max(0, p));
}
