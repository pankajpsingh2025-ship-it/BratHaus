"use client";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { MeshStandardMaterial, type Group } from "three";
import type { ExampleMedia } from "@/content/example-business";
import { rig } from "@/lib/rig";
import SalonSiteDesktop, { type SiteLayer } from "./ui/SalonSiteDesktop";
import { BROWSER, damp, dampXf, parts, PHONE, screenH } from "./parts";
import Screen, { type HoleRect } from "./Screen";

// A floating browser panel (no logos, three small dots) holding the salon's site as four DOM layers
// that separate in depth for the "exploded" moment. Lite keeps three depths (cards + button together).
const panel = new MeshStandardMaterial({ color: "#1B1A18", roughness: 0.6, metalness: 0.2, transparent: true });
const rim = new MeshStandardMaterial({ color: "#4a4741", roughness: 0.5, metalness: 0.3, transparent: true });
const dot = new MeshStandardMaterial({ color: "#3a3833", roughness: 0.6, transparent: true });
export const browserMaterials = [panel, rim, dot];

export const BROWSER_SCREEN_Y = -BROWSER.bar / 2 + 0.005;
const DEPTH = [0, 0.14, 0.28, 0.42];
const DEPTH_LITE = [0, 0.14, 0.28, 0.28];
// The transparent upper layers cut holes only where their content is (fractions of the screen), so
// a separated layer never punches a square hole through the panel's rounded corner.
const HOLES: (HoleRect | undefined)[] = [undefined, { x: 0.03, y: 0.19, w: 0.58, h: 0.38 }, { x: 0.03, y: 0.73, w: 0.94, h: 0.2 }, { x: 0.03, y: 0.55, w: 0.34, h: 0.12, r: 0.01 }];
// how much taller (relative to its width) the phone's screen is than the browser's: the browser starts
// stretched to exactly the phone screen's rectangle and settles into its own shape
const STRETCH = (PHONE.screenH / PHONE.screenW) / (screenH(BROWSER) / BROWSER.screenW);

export default function Browser({ media, lite, zoom = 1 }: { media: ExampleMedia; lite: boolean; zoom?: number }) {
  const q = useRef(0);
  const g = useRef<Group>(null);
  const layers = useRef<(Group | null)[]>([]);
  const B = BROWSER;
  // the screen area sits under the top bar
  const screenY = BROWSER_SCREEN_Y;
  useFrame((_, dt) => {
    const o = g.current; if (!o) return;
    dampXf(o, rig.browser, dt);
    q.current = damp(q.current, rig.browser.q, dt);
    o.scale.y = o.scale.x * (1 + (STRETCH - 1) * q.current);
    const op = rig.browser.o;
    panel.opacity = rim.opacity = dot.opacity = op;
    const depth = lite ? DEPTH_LITE : DEPTH;
    layers.current.forEach((l, i) => { if (l) l.position.z = damp(l.position.z, 0.017 + depth[i] * rig.layers.spread, dt); });
    parts.layerUi.forEach((el) => { if (el) el.style.opacity = op.toFixed(3); });
  });
  return (
    <group ref={(el) => { g.current = el; parts.browser = el; }}>
      <RoundedBox args={[B.w + 0.016, B.h + 0.016, B.d * 0.6]} radius={0.048} smoothness={4} position={[0, 0, -0.008]} material={rim} />
      <RoundedBox args={[B.w, B.h, B.d]} radius={0.04} smoothness={4} material={panel} />
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-B.w / 2 + 0.08 + i * 0.05, B.h / 2 - B.bar / 2 - 0.005, B.d / 2 + 0.002]} material={dot}>
          <circleGeometry args={[0.014, 16]} />
        </mesh>
      ))}
      {([0, 1, 2, 3] as SiteLayer[]).map((i) => (
        <group key={i} ref={(el) => { layers.current[i] = el; parts.layers[i] = el; }} position={[0, screenY, 0.017]}>
          <Screen cssW={B.cssW} cssH={B.cssH} worldW={B.screenW} radius={i === 0 ? B.screenR : 0} zoom={zoom} hole={HOLES[i]}>
            <div ref={(el) => { parts.layerUi[i] = el; }}><SalonSiteDesktop layer={i} media={media} /></div>
          </Screen>
        </group>
      ))}
    </group>
  );
}
