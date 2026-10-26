"use client";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useEffect, useRef, type RefObject } from "react";
import { Vector2 } from "three";
import { readProgress } from "./progress";
export { readProgress };

// A smooth, damped pointer in -1..1 (viewport), shared by every moment's parallax.
const target = new Vector2();
export const pointerClient = { x: -9999, y: -9999 };
let listening = false;
function listen() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  addEventListener("pointermove", (e) => { pointerClient.x = e.clientX; pointerClient.y = e.clientY; target.set((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1)); }, { passive: true });
}
export function usePointer(lambda = 0.25) {
  const p = useRef(new Vector2());
  useEffect(listen, []);
  useFrame((_, dt) => { easing.damp2(p.current, target, lambda, Math.min(dt, 0.1)); });
  return p;
}
export const pointerTarget = target;

// Is the element on (or near) the screen? Off-screen moments skip all per-frame work.
export function useInView(el: RefObject<Element | null>, margin = "20% 0px") {
  const v = useRef(false);
  useEffect(() => {
    const node = el.current; if (!node) return;
    const io = new IntersectionObserver(([e]) => { v.current = e.isIntersecting; }, { rootMargin: margin });
    io.observe(node);
    return () => io.disconnect();
  }, [el, margin]);
  return v;
}

// Scroll progress, readable inside useFrame without re-rendering.
//  through: top meets screen bottom → bottom leaves top · pin: sticky span · exit: hero scrolling away
export function useScrollProgress(el: RefObject<Element | null>, mode: "through" | "pin" | "exit" = "through") {
  const p = useRef(0);
  useFrame(() => { p.current = readProgress(el.current, mode); });
  return p;
}

// Hover on a DOM element (tiles, cards), readable in useFrame.
export function useHoverRef(el: RefObject<Element | null>) {
  const h = useRef(false);
  useEffect(() => {
    const node = el.current; if (!node) return;
    const on = () => { h.current = true; }, off = () => { h.current = false; };
    node.addEventListener("pointerenter", on); node.addEventListener("pointerleave", off);
    node.addEventListener("focusin", on); node.addEventListener("focusout", off);
    return () => { node.removeEventListener("pointerenter", on); node.removeEventListener("pointerleave", off); node.removeEventListener("focusin", on); node.removeEventListener("focusout", off); };
  }, [el]);
  return h;
}
