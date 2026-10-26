"use client";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import { MathUtils, MeshPhysicalMaterial, MeshStandardMaterial, type Group } from "three";
import { rig } from "@/lib/rig";
import { damp, dampXf, LAPTOP, parts, TABLET } from "./parts";
import Screen from "./Screen";

const alu = new MeshPhysicalMaterial({ color: "#2B2B2B", metalness: 1, roughness: 0.38, envMapIntensity: 1.1 });
const deck = new MeshStandardMaterial({ color: "#1c1c1c", metalness: 0.6, roughness: 0.55 });
const bezel = new MeshStandardMaterial({ color: "#050505", roughness: 0.4, metalness: 0.2 });
export const laptopMaterials = [alu, deck, bezel];

// lid: closed lies forward over the base (+90° here, the brief's −90°), open leans back 12° (−12°)
const CLOSED = Math.PI / 2, OPEN = MathUtils.degToRad(-12);

export function LaptopBody({ open, children, register, portal = true, zoom = 1 }: { open: { current: number }; children: ReactNode; register?: (g: Group | null) => void; portal?: boolean; zoom?: number }) {
  const L = LAPTOP;
  const lid = useRef<Group>(null);
  useFrame((_, dt) => {
    if (!lid.current) return;
    lid.current.rotation.x = damp(lid.current.rotation.x, CLOSED + (OPEN - CLOSED) * open.current, dt);
  });
  return (
    <>
      <RoundedBox args={[L.w, L.base, L.d]} radius={0.03} smoothness={4} material={alu} />
      {/* keyboard deck and trackpad */}
      <mesh position={[0, L.base / 2 + 0.001, -0.2]} rotation-x={-Math.PI / 2} material={deck}><planeGeometry args={[L.w * 0.86, L.d * 0.46]} /></mesh>
      <mesh position={[0, L.base / 2 + 0.001, 0.62]} rotation-x={-Math.PI / 2} material={deck}><planeGeometry args={[L.w * 0.32, L.d * 0.24]} /></mesh>
      {/* the lid, hinged at the back edge */}
      <group ref={lid} position={[0, L.base / 2, -L.d / 2 + 0.03]} rotation-x={CLOSED}>
        <RoundedBox args={[L.w, L.lidH, L.lid]} radius={0.03} smoothness={4} position={[0, L.lidH / 2, -L.lid / 2]} material={alu} />
        <mesh position={[0, L.lidH / 2, 0.001]} material={bezel}><planeGeometry args={[L.w - 0.04, L.lidH - 0.04]} /></mesh>
        <group ref={register} position={[0, L.lidH / 2 + 0.03, 0.003]}>
          <Screen cssW={L.cssW} cssH={L.cssH} worldW={L.screenW} radius={L.screenR} portal={portal} zoom={zoom}>{children}</Screen>
        </group>
      </group>
    </>
  );
}

export function TabletBody({ children, register, zoom = 1 }: { children: ReactNode; register?: (g: Group | null) => void; zoom?: number }) {
  const T = TABLET;
  return (
    <>
      <RoundedBox args={[T.w, T.h, T.d]} radius={0.09} smoothness={6} material={alu} />
      <mesh position={[0, 0, T.d / 2 + 0.001]} material={bezel}><planeGeometry args={[T.w - 0.08, T.h - 0.08]} /></mesh>
      <group ref={register} position={[0, 0, T.d / 2 + 0.003]}>
        <Screen cssW={T.cssW} cssH={T.cssH} worldW={T.screenW} radius={T.screenR} zoom={zoom}>{children}</Screen>
      </group>
    </>
  );
}

// The story's laptop (a tablet slab on portrait): rises from below and opens; the dashboard on its screen.
export default function Laptop({ tall, children, ui, zoom }: { tall: boolean; children: ReactNode; ui: { current: HTMLElement | null }; zoom?: number }) {
  const g = useRef<Group>(null);
  const open = useRef(0);
  useFrame((_, dt) => {
    const o = g.current; if (!o) return;
    dampXf(o, rig.laptop, dt);
    open.current = rig.lid.open;
    const show = o.visible && (tall || rig.lid.open > 0.12);
    if (ui.current) { ui.current.style.visibility = show ? "visible" : "hidden"; ui.current.style.opacity = rig.laptop.o.toFixed(3); }
  });
  return (
    <group ref={(el) => { g.current = el; parts.laptop = el; }} visible={false}>
      {tall
        ? <TabletBody register={(el) => { parts.screen = el; }} zoom={zoom}>{children}</TabletBody>
        : <LaptopBody open={open} register={(el) => { parts.screen = el; }} zoom={zoom}>{children}</LaptopBody>}
    </group>
  );
}
