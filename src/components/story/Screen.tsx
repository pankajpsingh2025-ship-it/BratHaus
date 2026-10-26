"use client";
import { Html } from "@react-three/drei";
import { useContext, useMemo, type CSSProperties, type ReactNode, type RefObject } from "react";
import { FrontSide, NoBlending, Shape, ShapeGeometry, ShaderMaterial } from "three";
import { htmlLayer } from "@/lib/storyHost";
import { SlotCtx } from "@/components/three/Slot";

// A device screen: real DOM UI placed on a 3D surface with drei <Html transform>.
// The DOM sits in a layer under the canvas; this plane cuts a hole of exactly the screen's shape in
// the canvas (it writes transparent pixels with no blending, whatever is drawn first), so bezels and
// anything in front of the screen still cover it correctly as the device turns.
//
// Sharpness: the UI is designed at cssW × cssH, then laid out with CSS `zoom` at the size it really
// appears on screen at the device's main pose (`zoom`), so the 3D transform is ≈ 1 and 1 CSS px is
// 1 device px. The UI's text never drops below 12 real px (it reads --z, see screens.module.css),
// and below zoom 0.7 / 0.45 the UI switches to its denser layouts (data-size m / s).
const holeMaterial = new ShaderMaterial({
  vertexShader: "void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
  fragmentShader: "void main(){ gl_FragColor = vec4(0.0); }",
  blending: NoBlending, side: FrontSide, transparent: false,
});

export function roundedRect(w: number, h: number, r: number, x0 = -w / 2, y0 = -h / 2) {
  const s = new Shape(), x = x0, y = y0;
  if (r <= 0) { s.moveTo(x, y); s.lineTo(x + w, y); s.lineTo(x + w, y + h); s.lineTo(x, y + h); s.lineTo(x, y); return new ShapeGeometry(s); }
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return new ShapeGeometry(s, 8);
}

/** A part of the screen (fractions of its width and height, from the top-left) that should cut a hole. */
export type HoleRect = { x: number; y: number; w: number; h: number; r?: number };

export default function Screen({ cssW, cssH, worldW, radius = 0, position = [0, 0, 0], children, hidden = false, portal = true, zoom = 1, hole }: {
  cssW: number; cssH: number; worldW: number; radius?: number; position?: [number, number, number];
  children: ReactNode; hidden?: boolean; portal?: boolean;
  /** real px per design px at the device's main pose */
  zoom?: number;
  /** only this part of the screen cuts a hole (for the website's transparent upper layers) */
  hole?: HoleRect;
}) {
  const worldH = (worldW * cssH) / cssW;
  const geometry = useMemo(() => {
    if (!hole) return roundedRect(worldW, worldH, radius);
    return roundedRect(hole.w * worldW, hole.h * worldH, hole.r ?? 0, -worldW / 2 + hole.x * worldW, worldH / 2 - (hole.y + hole.h) * worldH);
  }, [worldW, worldH, radius, hole]);
  // Inside a View (inner pages) the DOM goes into that View's own box, explicitly: Views share the
  // canvas's event state, so relying on it would move screens between Views as each one mounts.
  const slot = useContext(SlotCtx);
  const target = portal ? (htmlLayer as RefObject<HTMLElement>) : (slot?.el as RefObject<HTMLElement> | undefined);
  if (!target) return null;
  const z = Math.max(0.05, zoom);
  const w = cssW * z, h = cssH * z;
  const rPx = hole ? 0 : (radius / worldW) * w;
  return (
    <Html
      transform
      occlude="blending"
      portal={target}
      position={position}
      // world size = css px × distanceFactor / 400
      distanceFactor={(worldW / w) * 400}
      geometry={<primitive object={geometry} attach="geometry" />}
      material={<primitive object={holeMaterial} attach="material" />}
      pointerEvents="none"
      style={{ width: w, height: h, borderRadius: rPx, overflow: "hidden", visibility: hidden ? "hidden" : "visible" }}
    >
      <div className="device-ui" data-size={z < 0.45 ? "s" : z < 0.7 ? "m" : "l"} style={{ width: cssW, height: cssH, zoom: z, "--z": z } as CSSProperties}>{children}</div>
    </Html>
  );
}
