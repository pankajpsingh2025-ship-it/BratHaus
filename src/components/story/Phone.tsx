"use client";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import { MeshPhysicalMaterial, type Group } from "three";
import { rig, story, type Xf } from "@/lib/rig";
import { dampXf, PHONE } from "./parts";
import Screen from "./Screen";

// The hero object: a phone with a champagne titanium frame. Procedural, no model downloads.
const body = new MeshPhysicalMaterial({ color: "#141414", roughness: 0.35, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 0.5 });
const frame = new MeshPhysicalMaterial({ color: "#C9A574", metalness: 1, roughness: 0.3, envMapIntensity: 0.55 });
export const phoneMaterials = [body, frame];

const TAU = Math.PI * 2;
const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 4);

// No glass sheen over the screen (it greyed the UI out) and no side buttons (they stuck out of the
// frame): the screen is opaque and the band is one clean edge.
export function PhoneBody({ children, portal = true, zoom = 1 }: { children: ReactNode; portal?: boolean; zoom?: number }) {
  const P = PHONE;
  return (
    <>
      {/* titanium band, just behind and a little larger than the glass body */}
      <RoundedBox args={[P.w + 0.02, P.h + 0.02, 0.07]} radius={P.r + 0.01} smoothness={8} position={[0, 0, -0.006]} material={frame} />
      <RoundedBox args={[P.w, P.h, P.d]} radius={P.r} smoothness={8} material={body} />
      <Screen cssW={P.cssW} cssH={P.cssH} worldW={P.screenW} radius={P.screenR} position={[0, 0, P.screenZ]} portal={portal} zoom={zoom}>{children}</Screen>
    </>
  );
}

// The story phone: follows rig.phone (damped), floats gently, rises in on the intro.
export default function Phone({ children, xf = rig.phone, register, zoom }: { children: ReactNode; xf?: Xf; register?: (g: Group | null) => void; zoom?: number }) {
  const g = useRef<Group>(null);
  const extra = useRef({ y: 0, ry: 0, rx: 0, s: 1 }).current;
  useFrame((st, dt) => {
    const o = g.current; if (!o) return;
    const t = st.clock.elapsedTime;
    const i = ease(story.intro);
    // a gentle float (y ±0.03 over 5s, a ±4° turn over 8s), calmer once the story is under way
    const calm = 1 - Math.min(1, rig.progress * 6);
    extra.y = Math.sin((t / 5) * TAU) * 0.03 * (0.4 + calm * 0.6) + (1 - i) * -0.4;
    extra.ry = Math.sin((t / 8) * TAU) * 4 * calm + (1 - i) * 12;
    dampXf(o, xf, dt, 6, extra);
  });
  return (
    <group ref={(el) => { g.current = el; register?.(el); }}>
      <PhoneBody zoom={zoom}>{children}</PhoneBody>
    </group>
  );
}
